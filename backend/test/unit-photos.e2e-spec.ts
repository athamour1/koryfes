import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import sharp from 'sharp';
import { DataSource } from 'typeorm';
import { User, UnitRole, UserRole } from '../src/users/entities/user.entity';
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
    let unitB: { id: number };
    let leaderToken: string;
    let memberToken: string;
    let adminBToken: string;
    let photoJpeg: Buffer;

    beforeAll(async () => {
        app = await createTestApp(storage);
        const locA = await seedLocation(app, 'Photos A');
        unitA = await seedUnit(app, 'Unit A', locA);
        await seedUser(app, 'photosSuper', UserRole.SUPER_ADMIN);
        superToken = await login(app, 'photosSuper');

        const locB = await seedLocation(app, 'Photos B');
        unitB = await seedUnit(app, 'Unit B', locB);
        const leaderA = await seedUser(app, 'leaderA', UserRole.USER, locA);
        const memberA = await seedUser(app, 'memberA', UserRole.USER, locA);
        await seedUser(app, 'adminB', UserRole.ADMIN, locB);
        const ds = app.get(DataSource);
        await ds.getRepository(User).update(leaderA.id, { unit: { id: unitA.id }, unitRole: UnitRole.LEADER });
        await ds.getRepository(User).update(memberA.id, { unit: { id: unitA.id }, unitRole: UnitRole.MEMBER });
        leaderToken = await login(app, 'leaderA');
        memberToken = await login(app, 'memberA');
        adminBToken = await login(app, 'adminB');
        photoJpeg = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: '#a73' } }).jpeg().toBuffer();
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

    const upload = (token: string, unitId: number, kind: string) =>
        http()
            .post(`/units/${unitId}/photos?kind=${kind}`)
            .set('Authorization', `Bearer ${token}`)
            .attach('file', photoJpeg, {
                filename: 'p.jpg',
                contentType: 'image/jpeg',
            });

    describe('POST /units/:id/photos', () => {
        it('lets the unit leader add up to 9 activity photos, resized to 1600px', async () => {
            for (let i = 0; i < 9; i++) {
                const res = await upload(leaderToken, unitA.id, 'activity').expect(201);
                const meta = await sharp(storage.objects.get(res.body.path.replace('/uploads/', '')).body).metadata();
                expect(meta.width).toBe(1600);
            }
            await upload(leaderToken, unitA.id, 'activity').expect(400);
            const unit = await http().get(`/units/${unitA.id}`).set('Authorization', `Bearer ${leaderToken}`).expect(200);
            expect(unit.body.photos.filter((p) => p.kind === 'activity')).toHaveLength(9);
        });

        it('keeps a single corner photo and deletes the replaced object', async () => {
            const first = await upload(leaderToken, unitA.id, 'corner').expect(201);
            const second = await upload(leaderToken, unitA.id, 'corner').expect(201);
            const unit = await http().get(`/units/${unitA.id}`).set('Authorization', `Bearer ${leaderToken}`).expect(200);
            expect(unit.body.photos.filter((p) => p.kind === 'corner').map((p) => p.id)).toEqual([second.body.id]);
            expect(storage.objects.has(first.body.path.replace('/uploads/', ''))).toBe(false);
        });

        it('rejects an unknown kind', () => upload(leaderToken, unitA.id, 'selfie').expect(400));

        it('rejects a plain member, another unit\'s leader and another location\'s admin', async () => {
            await upload(memberToken, unitA.id, 'activity').expect(401);
            await upload(leaderToken, unitB.id, 'activity').expect(401);
            await upload(adminBToken, unitA.id, 'activity').expect(401);
        });
    });

    describe('flag path cannot point at another unit\'s objects', () => {
        it('ignores a flag set through PATCH, so a later upload deletes nothing of unit B', async () => {
            const victim = await upload(superToken, unitB.id, 'activity').expect(201);
            const victimKey = victim.body.path.replace('/uploads/', '');
            await http()
                .patch(`/units/${unitA.id}`)
                .set('Authorization', `Bearer ${leaderToken}`)
                .send({ flag: victim.body.path })
                .expect(200);
            await http()
                .post(`/units/${unitA.id}/image`)
                .set('Authorization', `Bearer ${leaderToken}`)
                .attach('file', photoJpeg, { filename: 'f.jpg', contentType: 'image/jpeg' })
                .expect(201);
            expect(storage.objects.has(victimKey)).toBe(true);
        });
    });

    describe('DELETE /units/:id/photos/:photoId', () => {
        it('removes the photo and its object', async () => {
            const unit = await http().get(`/units/${unitA.id}`).set('Authorization', `Bearer ${leaderToken}`).expect(200);
            const photo = unit.body.photos.find((p) => p.kind === 'activity');
            await http().delete(`/units/${unitA.id}/photos/${photo.id}`).set('Authorization', `Bearer ${leaderToken}`).expect(200);
            expect(storage.objects.has(photo.path.replace('/uploads/', ''))).toBe(false);
        });

        it('returns 404 for a photo of another unit and deletes nothing', async () => {
            const own = await upload(superToken, unitB.id, 'corner').expect(201);
            await http().delete(`/units/${unitA.id}/photos/${own.body.id}`).set('Authorization', `Bearer ${superToken}`).expect(404);
            expect(storage.objects.has(own.body.path.replace('/uploads/', ''))).toBe(true);
        });
    });

    describe('DELETE /units/:id', () => {
        it('deletes the unit\'s objects from storage', async () => {
            const unit = await http().get(`/units/${unitB.id}`).set('Authorization', `Bearer ${superToken}`).expect(200);
            const keys = unit.body.photos.map((p) => p.path.replace('/uploads/', ''));
            expect(keys.length).toBeGreaterThan(0);
            await http().delete(`/units/${unitB.id}`).set('Authorization', `Bearer ${superToken}`).expect(200);
            keys.forEach((k) => expect(storage.objects.has(k)).toBe(false));
        });
    });
});
