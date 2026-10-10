import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import sharp from 'sharp';
import { UserRole } from '../src/users/entities/user.entity';
import { createTestApp, login, seedLocation, seedUnit, seedUser } from './helpers';
import { InMemoryStorage } from './in-memory-storage';

// 3000x2000 JPEG with EXIF (orientation + a GPS-like comment) for the resize/strip checks
export const bigJpeg = () =>
    sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#3a7' } })
        .jpeg()
        .withMetadata({ orientation: 1, exif: { IFD0: { ImageDescription: 'gps 37.98,23.73' } } })
        .toBuffer();

describe('Unit images (e2e)', () => {
    let app: NestExpressApplication;
    const storage = new InMemoryStorage();
    const http = () => request(app.getHttpServer());
    let superToken: string;
    let unitA: { id: number };

    beforeAll(async () => {
        app = await createTestApp(storage);
        const locA = await seedLocation(app, 'Photos A');
        unitA = await seedUnit(app, 'Unit A', locA);
        await seedUser(app, 'photosSuper', UserRole.SUPER_ADMIN);
        superToken = await login(app, 'photosSuper');
    });

    afterAll(async () => {
        await app?.close();
    });

    describe('POST /units/:id/image (flag)', () => {
        it('stores a resized WebP without EXIF and replaces the old flag', async () => {
            const input = await bigJpeg();
            expect((await sharp(input).metadata()).exif).toBeDefined();
            const first = await http()
                .post(`/units/${unitA.id}/image`)
                .set('Authorization', `Bearer ${superToken}`)
                .attach('file', input, { filename: 'flag.jpg', contentType: 'image/jpeg' })
                .expect(201);
            const firstKey = first.body.flag.replace('/uploads/', '');
            const stored = storage.objects.get(firstKey);
            expect(stored.contentType).toBe('image/webp');
            const meta = await sharp(stored.body).metadata();
            expect(meta.format).toBe('webp');
            expect(Math.max(meta.width, meta.height)).toBe(800);
            expect(meta.exif).toBeUndefined();

            const second = await http()
                .post(`/units/${unitA.id}/image`)
                .set('Authorization', `Bearer ${superToken}`)
                .attach('file', await bigJpeg(), { filename: 'flag.jpg', contentType: 'image/jpeg' })
                .expect(201);
            expect(second.body.flag).not.toBe(first.body.flag);
            expect(storage.objects.has(firstKey)).toBe(false);
        });

        it('rejects a file that claims to be an image but is not', () => {
            return http()
                .post(`/units/${unitA.id}/image`)
                .set('Authorization', `Bearer ${superToken}`)
                .attach('file', Buffer.from('not really a png'), { filename: 'x.png', contentType: 'image/png' })
                .expect(400);
        });
    });
});
