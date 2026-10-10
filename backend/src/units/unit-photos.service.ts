import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MAX_ACTIVITY_PHOTOS, UnitPhoto, UnitPhotoKind } from './entities/unit-photo.entity';
import { Unit } from './entities/unit.entity';
import { StorageService } from '../storage/storage.service';
import { keyFromUploadPath, newImageKey, toUploadPath } from '../storage/upload-paths';
import { deleteQuietly } from '../storage/delete-quietly';
import { IMAGE_MAX_SIDE, processImage } from '../common/image-upload';

@Injectable()
export class UnitPhotosService {
    // one change at a time per unit, so the limit and the single corner hold
    // under concurrent uploads (one backend instance)
    private readonly locks = new Map<number, Promise<unknown>>();

    constructor(
        @InjectRepository(UnitPhoto)
        private readonly photos: Repository<UnitPhoto>,
        private readonly storage: StorageService,
    ) { }

    async add(unit: Unit, kind: UnitPhotoKind, file: Buffer): Promise<UnitPhoto> {
        // decode/resize outside the lock: it is the slow part and touches nothing shared
        const image = await processImage(file, IMAGE_MAX_SIDE.photo);
        return this.withLock(unit.id, async () => {
            const existing = await this.photos.find({ where: { unit: { id: unit.id }, kind } });
            if (kind === 'activity' && existing.length >= MAX_ACTIVITY_PHOTOS) {
                throw new BadRequestException(`A unit can have at most ${MAX_ACTIVITY_PHOTOS} activity photos`);
            }
            const key = newImageKey(`unit-photos/${unit.id}`);
            await this.storage.put(key, image, 'image/webp');
            let photo: UnitPhoto;
            try {
                photo = await this.photos.save(this.photos.create({ unit: { id: unit.id }, kind, path: toUploadPath(key) }));
            } catch (e) {
                await deleteQuietly(this.storage, [key]);
                throw e;
            }
            if (kind === 'corner') {
                // the corner has one photo: the new one replaces the old
                await this.deleteRowsAndObjects(existing);
            }
            const { unit: _unit, ...saved } = photo;
            return saved as UnitPhoto;
        });
    }

    async remove(unitId: number, photoId: number): Promise<void> {
        return this.withLock(unitId, async () => {
            const photo = await this.photos.findOne({ where: { id: photoId, unit: { id: unitId } } });
            if (!photo) {
                throw new NotFoundException('Photo not found');
            }
            await this.deleteRowsAndObjects([photo]);
        });
    }

    /** Keys of a unit's photos, for deleting them after the unit's rows are gone. */
    async objectKeys(unitId: number): Promise<string[]> {
        const photos = await this.photos.find({ where: { unit: { id: unitId } } });
        return photos.map((photo) => keyFromUploadPath(photo.path)).filter(Boolean);
    }

    private async deleteRowsAndObjects(photos: UnitPhoto[]) {
        if (!photos.length) return;
        await this.photos.delete(photos.map((photo) => photo.id));
        await deleteQuietly(this.storage, photos.map((photo) => keyFromUploadPath(photo.path)));
    }

    private withLock<T>(unitId: number, work: () => Promise<T>): Promise<T> {
        const previous = this.locks.get(unitId) ?? Promise.resolve();
        const run = previous.catch(() => undefined).then(work);
        const settled = run.catch(() => undefined);
        this.locks.set(unitId, settled);
        settled.then(() => {
            if (this.locks.get(unitId) === settled) this.locks.delete(unitId);
        });
        return run;
    }
}
