import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Path } from './path.entity';
import { PathCategory } from './path-category.enum';

@Injectable()
export class PathsService {
    constructor(
        @InjectRepository(Path)
        private pathsRepository: Repository<Path>,
    ) { }

    async findAll(category?: PathCategory): Promise<Path[]> {
        if (category) {
            return this.pathsRepository.find({ where: { category } });
        }
        return this.pathsRepository.find();
    }

    async findOne(id: number): Promise<Path> {
        return this.pathsRepository.findOne({ where: { id } });
    }

    async create(pathData: Partial<Path>): Promise<Path> {
        const path = this.pathsRepository.create(pathData);
        return this.pathsRepository.save(path);
    }

    async update(id: number, pathData: Partial<Path>): Promise<Path> {
        await this.pathsRepository.update(id, pathData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.pathsRepository.delete(id);
    }
}
