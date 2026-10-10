import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MAX_ACTIVITY_PHOTOS, UnitPhoto, UnitPhotoKind } from './entities/unit-photo.entity';
import { Unit } from './entities/unit.entity';
import { StorageService } from '../storage/storage.service';
import { keyFromUploadPath, newImageKey, toUploadPath } from '../storage/upload-paths';
import { IMAGE_MAX_SIDE, processImage } from '../common/image-upload';

@Injectable()
export class UnitPhotosService {
    constructor(
        @InjectRepository(UnitPhoto)
        private readonly photos: Repository<UnitPhoto>,
        private readonly storage: StorageService,
    ) { }

    async add(unit: Unit, kind: UnitPhotoKind, file: Buffer): Promise<UnitPhoto> {
        const existing = await this.photos.find({ where: { unit: { id: unit.id }, kind } });
        if (kind === 'activity' && existing.length >= MAX_ACTIVITY_PHOTOS) {
            throw new BadRequestException(`A unit can have at most ${MAX_ACTIVITY_PHOTOS} activity photos`);
        }
        const key = newImageKey(`unit-photos/${unit.id}`);
        await this.storage.put(key, await processImage(file, IMAGE_MAX_SIDE.photo), 'image/webp');
        const photo = await this.photos.save(this.photos.create({ unit: { id: unit.id }, kind, path: toUploadPath(key) }));
        if (kind === 'corner') {
            // the corner has one photo: the new one replaces the old
            for (const old of existing) {
                await this.deleteRowAndObject(old);
            }
        }
        const { unit: _unit, ...saved } = photo;
        return saved as UnitPhoto;
    }

    async remove(unitId: number, photoId: number): Promise<void> {
        const photo = await this.photos.findOne({ where: { id: photoId, unit: { id: unitId } } });
        if (!photo) {
            throw new NotFoundException('Photo not found');
        }
        await this.deleteRowAndObject(photo);
    }

    /** Before a unit is deleted (rows go by cascade, objects don't). */
    async removeAllObjects(unitId: number): Promise<void> {
        const photos = await this.photos.find({ where: { unit: { id: unitId } } });
        for (const photo of photos) {
            const key = keyFromUploadPath(photo.path);
            if (key) await this.storage.delete(key);
        }
    }

    private async deleteRowAndObject(photo: UnitPhoto) {
        await this.photos.delete(photo.id);
        const key = keyFromUploadPath(photo.path);
        if (key) await this.storage.delete(key);
    }
}
