import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Peak } from './peak.entity';

// Read-only: the catalog is fixed in code (src/catalog) and synced on startup
@Injectable()
export class PeaksService {
    constructor(
        @InjectRepository(Peak)
        private repository: Repository<Peak>,
    ) { }

    async findAll(): Promise<Peak[]> {
        return this.repository.find({ order: { order: 'ASC' } });
    }

    async findOne(id: number): Promise<Peak> {
        const item = await this.repository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException();
        }
        return item;
    }
}
