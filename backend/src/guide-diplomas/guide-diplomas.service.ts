import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuideDiploma } from './guide-diploma.entity';

@Injectable()
export class GuideDiplomasService {
    constructor(
        @InjectRepository(GuideDiploma)
        private guideDiplomasRepository: Repository<GuideDiploma>,
    ) { }

    async findAll(): Promise<GuideDiploma[]> {
        return this.guideDiplomasRepository.find({ order: { level: 'ASC' } });
    }

    async findOne(id: number): Promise<GuideDiploma> {
        return this.guideDiplomasRepository.findOne({ where: { id } });
    }

    async create(diplomaData: Partial<GuideDiploma>): Promise<GuideDiploma> {
        const diploma = this.guideDiplomasRepository.create(diplomaData);
        return this.guideDiplomasRepository.save(diploma);
    }

    async update(id: number, diplomaData: Partial<GuideDiploma>): Promise<GuideDiploma> {
        await this.guideDiplomasRepository.update(id, diplomaData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.guideDiplomasRepository.delete(id);
    }
}
