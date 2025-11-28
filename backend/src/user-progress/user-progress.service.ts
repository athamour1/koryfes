import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from './user-progress.entity';
import { Peak } from '../peaks/peak.entity';
import { Path } from '../paths/path.entity';
import { GuideDiploma } from '../guide-diplomas/guide-diploma.entity';
import { ElectiveDiploma } from '../elective-diplomas/elective-diploma.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UserProgressService {
    constructor(
        @InjectRepository(UserProgress)
        private userProgressRepository: Repository<UserProgress>,
        @InjectRepository(Peak)
        private peakRepository: Repository<Peak>,
        @InjectRepository(Path)
        private pathRepository: Repository<Path>,
        @InjectRepository(GuideDiploma)
        private guideDiplomaRepository: Repository<GuideDiploma>,
        @InjectRepository(ElectiveDiploma)
        private electiveDiplomaRepository: Repository<ElectiveDiploma>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    /**
     * Initialize progress for a new user WITHOUT any peak
     * User must earn Promise peak before progressing
     */
    async initializeProgress(userId: number): Promise<UserProgress> {
        // Check if progress already exists
        const existing = await this.userProgressRepository.findOne({
            where: { user: { id: userId } }
        });

        if (existing) {
            return existing;
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Create initial progress WITHOUT a current peak
        // User must earn Promise peak first
        const userProgress = this.userProgressRepository.create({
            user,
            currentPeak: null,
            completedPaths: [],
            guideDiplomas: [],
            electiveDiplomas: [],
        });

        return this.userProgressRepository.save(userProgress);
    }

    /**
     * Get user's complete progress with all relations
     */
    async getUserProgress(userId: number): Promise<UserProgress> {
        const progress = await this.userProgressRepository.findOne({
            where: { user: { id: userId } },
            relations: ['currentPeak', 'completedPaths', 'guideDiplomas', 'electiveDiplomas', 'user'],
        });

        if (!progress) {
            // Auto-initialize if not found
            return this.initializeProgress(userId);
        }

        return progress;
    }

    /**
     * Award a path to the user
     */
    async awardPath(userId: number, pathId: number): Promise<UserProgress> {
        const progress = await this.getUserProgress(userId);
        const path = await this.pathRepository.findOne({ where: { id: pathId } });

        if (!path) {
            throw new NotFoundException('Path not found');
        }

        // Check if already awarded
        if (progress.completedPaths.some(p => p.id === pathId)) {
            throw new BadRequestException('Path already awarded');
        }

        progress.completedPaths.push(path);
        await this.userProgressRepository.save(progress);

        // Check for peak unlock
        await this.checkAndUnlockPeaks(userId);

        return this.getUserProgress(userId);
    }

    /**
     * Award a diploma to the user
     */
    async awardDiploma(userId: number, diplomaId: number, type: 'guide' | 'elective'): Promise<UserProgress> {
        const progress = await this.getUserProgress(userId);

        if (type === 'guide') {
            const diploma = await this.guideDiplomaRepository.findOne({ where: { id: diplomaId } });
            if (!diploma) {
                throw new NotFoundException('Guide diploma not found');
            }

            if (progress.guideDiplomas.some(d => d.id === diplomaId)) {
                throw new BadRequestException('Diploma already awarded');
            }

            progress.guideDiplomas.push(diploma);
        } else {
            const diploma = await this.electiveDiplomaRepository.findOne({ where: { id: diplomaId } });
            if (!diploma) {
                throw new NotFoundException('Elective diploma not found');
            }

            if (progress.electiveDiplomas.some(d => d.id === diplomaId)) {
                throw new BadRequestException('Diploma already awarded');
            }

            progress.electiveDiplomas.push(diploma);
        }

        await this.userProgressRepository.save(progress);

        // Check for peak unlock
        await this.checkAndUnlockPeaks(userId);

        return this.getUserProgress(userId);
    }

    /**
     * Check requirements and auto-unlock peaks
     * 
     * Peak Requirements (cumulative):
     * - Promise (order 1): Must be manually awarded by admin/leader - unlocks paths/diplomas section
     * - Bronze (order 2): 4 paths (any category) + 1st Guide Diploma + 1 elective diploma
     * - Silver (order 3): 8 paths (any category) + 2nd Guide Diploma + 2 elective diplomas
     * - Gold (order 4): 12 paths (any category) + 3rd Guide Diploma + 4 elective diplomas
     */
    async checkAndUnlockPeaks(userId: number): Promise<void> {
        const progress = await this.getUserProgress(userId);

        // If no current peak, user must earn Promise first (manually awarded)
        if (!progress.currentPeak) {
            return;
        }

        const currentOrder = progress.currentPeak.order;

        const pathCount = progress.completedPaths.length;
        const guideDiplomaLevels = progress.guideDiplomas.map(d => d.level).sort();
        const electiveDiplomaCount = progress.electiveDiplomas.length;

        const hasGuideDiploma = (level: number) => guideDiplomaLevels.includes(level);

        let newPeakOrder = currentOrder;

        // Check for Gold Peak (order 4)
        if (currentOrder < 4 && pathCount >= 12 && hasGuideDiploma(3) && electiveDiplomaCount >= 4) {
            newPeakOrder = 4;
        }
        // Check for Silver Peak (order 3)
        else if (currentOrder < 3 && pathCount >= 8 && hasGuideDiploma(2) && electiveDiplomaCount >= 2) {
            newPeakOrder = 3;
        }
        // Check for Bronze Peak (order 2)
        else if (currentOrder < 2 && pathCount >= 4 && hasGuideDiploma(1) && electiveDiplomaCount >= 1) {
            newPeakOrder = 2;
        }

        // Update peak if unlocked
        if (newPeakOrder > currentOrder) {
            const newPeak = await this.peakRepository.findOne({ where: { order: newPeakOrder } });
            if (newPeak) {
                progress.currentPeak = newPeak;
                await this.userProgressRepository.save(progress);
            }
        }
    }

    /**
     * Manually award a peak (for Promise peak or testing)
     */
    async awardPeak(userId: number, peakId: number): Promise<UserProgress> {
        const progress = await this.getUserProgress(userId);
        const peak = await this.peakRepository.findOne({ where: { id: peakId } });

        if (!peak) {
            throw new NotFoundException('Peak not found');
        }

        progress.currentPeak = peak;
        await this.userProgressRepository.save(progress);

        return this.getUserProgress(userId);
    }

    /**
     * Get all user progress records (admin only)
     */
    async findAll(): Promise<UserProgress[]> {
        return this.userProgressRepository.find({
            relations: ['currentPeak', 'completedPaths', 'guideDiplomas', 'electiveDiplomas', 'user'],
        });
    }
}
