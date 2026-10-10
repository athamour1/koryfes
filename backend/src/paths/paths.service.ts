import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Path } from './path.entity';
import { PathCategory } from './path-category.enum';

// Read-only: the catalog is fixed in code (src/catalog) and synced on startup
@Injectable()
export class PathsService {
    constructor(
        @InjectRepository(Path)
        private repository: Repository<Path>,
    ) { }

    async findAll(category?: PathCategory): Promise<Path[]> {
        return this.repository.find({
            where: category ? { category } : {},
            order: { category: 'ASC', number: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Path> {
        const item = await this.repository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException();
        }
        return item;
    }
}
