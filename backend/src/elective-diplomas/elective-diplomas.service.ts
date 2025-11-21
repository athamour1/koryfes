import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElectiveDiploma } from './elective-diploma.entity';

@Injectable()
export class ElectiveDiplomasService {
    constructor(
        @InjectRepository(ElectiveDiploma)
        private electiveDiplomasRepository: Repository<ElectiveDiploma>,
    ) { }

    async findAll(): Promise<ElectiveDiploma[]> {
        return this.electiveDiplomasRepository.find();
    }

    async findOne(id: number): Promise<ElectiveDiploma> {
        return this.electiveDiplomasRepository.findOne({ where: { id } });
    }

    async create(diplomaData: Partial<ElectiveDiploma>): Promise<ElectiveDiploma> {
        const diploma = this.electiveDiplomasRepository.create(diplomaData);
        return this.electiveDiplomasRepository.save(diploma);
    }

    async update(id: number, diplomaData: Partial<ElectiveDiploma>): Promise<ElectiveDiploma> {
        await this.electiveDiplomasRepository.update(id, diplomaData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.electiveDiplomasRepository.delete(id);
    }
}
