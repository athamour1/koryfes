import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuideDiploma } from './guide-diploma.entity';

// Read-only: the catalog is fixed in code (src/catalog) and synced on startup
@Injectable()
export class GuideDiplomasService {
    constructor(
        @InjectRepository(GuideDiploma)
        private repository: Repository<GuideDiploma>,
    ) { }

    async findAll(): Promise<GuideDiploma[]> {
        return this.repository.find({ order: { level: 'ASC' } });
    }

    async findOne(id: number): Promise<GuideDiploma> {
        const item = await this.repository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException();
        }
        return item;
    }
}
