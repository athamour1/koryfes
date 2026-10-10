import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from './user-progress.entity';
import { Peak } from '../peaks/peak.entity';
import { PeakType } from '../peaks/peak-type.enum';
import { Path } from '../paths/path.entity';
import { GuideDiploma } from '../guide-diplomas/guide-diploma.entity';
import { ElectiveDiploma } from '../elective-diplomas/elective-diploma.entity';
import { User } from '../users/entities/user.entity';
import { evaluateProgress, ProgressEvaluation } from '../catalog/progress-rules';

export type DiplomaType = 'guide' | 'elective';

const RELATIONS = ['currentPeak', 'completedPaths', 'guideDiplomas', 'electiveDiplomas'];

/**
 * Individual progress of a Guide. Leaders award the Promise, paths and
 * diplomas; the current peak is always derived from them with the book's
 * rules (see catalog/progress-rules.ts) and is never set by hand.
 */
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
     * Location and unit of a user, for access checks
     */
    async getUserScope(userId: number): Promise<{ locationId?: number; unitId?: number }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['location', 'unit'],
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return { locationId: user.location?.id, unitId: user.unit?.id };
    }

    /**
     * Progress with all relations, created on first access
     */
    async getUserProgress(userId: number): Promise<UserProgress> {
        const progress = await this.userProgressRepository.findOne({
            where: { userId },
            relations: RELATIONS,
        });
        if (progress) {
            return progress;
        }

        if (!(await this.userRepository.exists({ where: { id: userId } }))) {
            throw new NotFoundException('User not found');
        }
        await this.userProgressRepository.save(this.userProgressRepository.create({
            userId,
            currentPeak: null,
            completedPaths: [],
            guideDiplomas: [],
            electiveDiplomas: [],
        }));
        return this.userProgressRepository.findOneOrFail({ where: { userId }, relations: RELATIONS });
    }

    /**
     * Progress plus the per-peak checklist of what is met and what is missing
     */
    async getProgressWithEvaluation(userId: number): Promise<UserProgress & { evaluation: ProgressEvaluation }> {
        const progress = await this.getUserProgress(userId);
        return Object.assign(progress, { evaluation: this.evaluate(progress) });
    }

    async setPromise(userId: number, given: boolean) {
        const progress = await this.getUserProgress(userId);
        const hasPromise = progress.currentPeak !== null;
        if (given === hasPromise) {
            throw new BadRequestException(given ? 'Promise already given' : 'No Promise to remove');
        }
        // the Promise is the base peak; recompute() raises it further if earned
        progress.currentPeak = given ? await this.peakRepository.findOneByOrFail({ type: PeakType.PROMISE }) : null;
        return this.saveAndRecompute(progress);
    }

    async awardPath(userId: number, pathId: number) {
        const progress = await this.getUserProgress(userId);
        const path = await this.pathRepository.findOne({ where: { id: pathId } });
        if (!path) {
            throw new NotFoundException('Path not found');
        }
        if (progress.completedPaths.some((p) => p.id === pathId)) {
            throw new BadRequestException('Path already awarded');
        }
        progress.completedPaths.push(path);
        return this.saveAndRecompute(progress);
    }

    async removePath(userId: number, pathId: number) {
        const progress = await this.getUserProgress(userId);
        if (!progress.completedPaths.some((p) => p.id === pathId)) {
            throw new NotFoundException('Path not awarded');
        }
        progress.completedPaths = progress.completedPaths.filter((p) => p.id !== pathId);
        return this.saveAndRecompute(progress);
    }

    async awardDiploma(userId: number, diplomaId: number, type: DiplomaType) {
        const progress = await this.getUserProgress(userId);
        const list = type === 'guide' ? progress.guideDiplomas : progress.electiveDiplomas;
        const diploma = type === 'guide'
            ? await this.guideDiplomaRepository.findOne({ where: { id: diplomaId } })
            : await this.electiveDiplomaRepository.findOne({ where: { id: diplomaId } });
        if (!diploma) {
            throw new NotFoundException('Diploma not found');
        }
        if (list.some((d) => d.id === diplomaId)) {
            throw new BadRequestException('Diploma already awarded');
        }
        (list as (GuideDiploma | ElectiveDiploma)[]).push(diploma);
        return this.saveAndRecompute(progress);
    }

    async removeDiploma(userId: number, diplomaId: number, type: DiplomaType) {
        const progress = await this.getUserProgress(userId);
        const key = type === 'guide' ? 'guideDiplomas' : 'electiveDiplomas';
        const list: { id: number }[] = progress[key];
        if (!list.some((d) => d.id === diplomaId)) {
            throw new NotFoundException('Diploma not awarded');
        }
        (progress as any)[key] = list.filter((d) => d.id !== diplomaId);
        return this.saveAndRecompute(progress);
    }

    private evaluate(progress: UserProgress): ProgressEvaluation {
        return evaluateProgress({
            hasPromise: progress.currentPeak !== null,
            pathCount: progress.completedPaths.length,
            guideDiplomaLevels: progress.guideDiplomas.map((d) => d.level),
            electiveDiplomaCount: progress.electiveDiplomas.length,
        });
    }

    private async saveAndRecompute(progress: UserProgress) {
        const { peak } = this.evaluate(progress);
        progress.currentPeak = peak ? await this.peakRepository.findOneByOrFail({ type: peak }) : null;
        progress.currentPeakId = progress.currentPeak?.id ?? null;
        await this.userProgressRepository.save(progress);
        return this.getProgressWithEvaluation(progress.userId);
    }
}
