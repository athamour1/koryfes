import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { Location } from '../locations/entities/location.entity';
import { StorageService } from '../storage/storage.service';
import { newImageKey, toUploadPath, unitFlagKey } from '../storage/upload-paths';
import { IMAGE_MAX_SIDE, processImage } from '../common/image-upload';
import { UnitPhotosService } from './unit-photos.service';
import { deleteQuietly } from '../storage/delete-quietly';
import { likeTerm, Page, paginate } from '../common/pagination';
import { UnitsQueryDto } from './dto/units-query.dto';

@Injectable()
export class UnitsService {
    constructor(
        @InjectRepository(Unit)
        private unitsRepository: Repository<Unit>,
        private readonly storage: StorageService,
        private readonly unitPhotos: UnitPhotosService,
    ) { }

    async create(createUnitDto: { name: string; description?: string; location: Location }): Promise<Unit> {
        const unit = this.unitsRepository.create(createUnitDto);
        return this.unitsRepository.save(unit);
    }

    /** Units with their location and how many members each has (memberCount) */
    async findAll(query: UnitsQueryDto): Promise<Unit[] | Page<Unit>> {
        const qb = this.unitsRepository
            .createQueryBuilder('unit')
            .leftJoinAndSelect('unit.location', 'location')
            .loadRelationCountAndMap('unit.memberCount', 'unit.users');

        if (query.locationId) {
            qb.andWhere('location.id = :locationId', { locationId: query.locationId });
        }
        if (query.search?.trim()) {
            qb.andWhere(`LOWER(unit.name) LIKE :search ESCAPE '\\'`, { search: likeTerm(query.search) });
        }

        return paginate(qb, query, { name: 'unit.name', location: 'location.name' }, 'name');
    }

    async findOne(id: number): Promise<Unit> {
        const unit = await this.unitsRepository.findOne({
            where: { id },
            relations: ['location', 'users', 'photos'],
            order: { photos: { createdAt: 'ASC', id: 'ASC' } },
        });
        if (!unit) {
            throw new NotFoundException(`Unit with ID ${id} not found`);
        }
        return unit;
    }

    async update(id: number, updateUnitDto: Partial<Unit>): Promise<Unit> {
        if (Object.keys(updateUnitDto).length) {
            await this.unitsRepository.update(id, updateUnitDto);
        }
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const unit = await this.findOne(id);
        // photo rows go by cascade; their objects (and the flag's) are deleted
        // after the rows, so a bucket failure can't leave rows without images
        const keys = [...(await this.unitPhotos.objectKeys(id)), unitFlagKey(unit.flag)];
        await this.unitsRepository.delete(id);
        await deleteQuietly(this.storage, keys);
    }

    async updateFlag(id: number, file: Buffer): Promise<Unit> {
        const unit = await this.findOne(id);
        const key = newImageKey('unit-flags');
        await this.storage.put(key, await processImage(file, IMAGE_MAX_SIDE.flag), 'image/webp');
        await this.unitsRepository.update(id, { flag: toUploadPath(key) });
        await deleteQuietly(this.storage, [unitFlagKey(unit.flag)]);
        return this.findOne(id);
    }
}
