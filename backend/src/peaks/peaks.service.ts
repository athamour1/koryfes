import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Peak } from './peak.entity';

@Injectable()
export class PeaksService {
    constructor(
        @InjectRepository(Peak)
        private peaksRepository: Repository<Peak>,
    ) { }

    async findAll(): Promise<Peak[]> {
        return this.peaksRepository.find({ order: { order: 'ASC' } });
    }

    async findOne(id: number): Promise<Peak> {
        return this.peaksRepository.findOne({ where: { id } });
    }

    async create(peakData: Partial<Peak>): Promise<Peak> {
        const peak = this.peaksRepository.create(peakData);
        return this.peaksRepository.save(peak);
    }

    async update(id: number, peakData: Partial<Peak>): Promise<Peak> {
        await this.peaksRepository.update(id, peakData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.peaksRepository.delete(id);
    }
}
