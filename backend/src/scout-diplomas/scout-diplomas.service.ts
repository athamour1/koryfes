import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoutDiploma } from './scout-diploma.entity';

@Injectable()
export class ScoutDiplomasService {
    constructor(
        @InjectRepository(ScoutDiploma)
        private scoutDiplomasRepository: Repository<ScoutDiploma>,
    ) { }

    async findAll(): Promise<ScoutDiploma[]> {
        return this.scoutDiplomasRepository.find({ order: { level: 'ASC' } });
    }

    async findOne(id: number): Promise<ScoutDiploma> {
        return this.scoutDiplomasRepository.findOne({ where: { id } });
    }

    async create(diplomaData: Partial<ScoutDiploma>): Promise<ScoutDiploma> {
        const diploma = this.scoutDiplomasRepository.create(diplomaData);
        return this.scoutDiplomasRepository.save(diploma);
    }

    async update(id: number, diplomaData: Partial<ScoutDiploma>): Promise<ScoutDiploma> {
        await this.scoutDiplomasRepository.update(id, diplomaData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.scoutDiplomasRepository.delete(id);
    }
}
