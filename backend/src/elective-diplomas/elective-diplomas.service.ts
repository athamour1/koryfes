import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElectiveDiploma } from './elective-diploma.entity';

// Read-only: the catalog is fixed in code (src/catalog) and synced on startup
@Injectable()
export class ElectiveDiplomasService {
    constructor(
        @InjectRepository(ElectiveDiploma)
        private repository: Repository<ElectiveDiploma>,
    ) { }

    async findAll(): Promise<ElectiveDiploma[]> {
        return this.repository.find({ order: { number: 'ASC' } });
    }

    async findOne(id: number): Promise<ElectiveDiploma> {
        const item = await this.repository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException();
        }
        return item;
    }
}
