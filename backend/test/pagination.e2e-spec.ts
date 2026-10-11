import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/users/entities/user.entity';
import { Location } from '../src/locations/entities/location.entity';
import { Unit } from '../src/units/entities/unit.entity';
import { UserProgressService } from '../src/user-progress/user-progress.service';
import { Path } from '../src/paths/path.entity';
import { createTestApp, login, seedLocation, seedUnit, seedUser } from './helpers';

describe('Paged lists (e2e)', () => {
    let app: NestExpressApplication;
    let superToken: string;
    let adminAToken: string;
    let locA: Location;
    let locB: Location;
    let unitA: Unit;
    let walker: User;

    const http = () => request(app.getHttpServer());
    const get = (url: string, token = superToken) => http().get(url).set('Authorization', `Bearer ${token}`);

    beforeAll(async () => {
        app = await createTestApp();
        locA = await seedLocation(app, 'Alpha');
        locB = await seedLocation(app, 'Beta');
        unitA = await seedUnit(app, 'Eagles', locA);
        await seedUnit(app, 'Owls', locB);

        await seedUser(app, 'root', UserRole.SUPER_ADMIN);
        await seedUser(app, 'captain-a', UserRole.ADMIN, locA);
        for (let i = 1; i <= 12; i++) {
            await seedUser(app, `guide-${String(i).padStart(2, '0')}`, UserRole.USER, i <= 7 ? locA : locB);
        }
        await seedUser(app, 'odd_name%', UserRole.USER, locA);

        const users = app.get(DataSource).getRepository(User);
        walker = await users.findOneByOrFail({ username: 'guide-01' });
        await users.update(walker.id, { unit: { id: unitA.id } });

        const progress = app.get(UserProgressService);
        const [path] = await app.get(DataSource).getRepository(Path).find({ take: 1 });
        await progress.setPromise(walker.id, true);
        await progress.awardPath(walker.id, path.id);

        superToken = await login(app, 'root');
        adminAToken = await login(app, 'captain-a');
    });

    afterAll(async () => {
        await app?.close();
    });

    describe('GET /users', () => {
        it('still returns the whole list without page', async () => {
            const res = await get('/users').expect(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(15);
        });

        it('returns one page with the total', async () => {
            const res = await get('/users?page=1&limit=5&role=user').expect(200);
            expect(res.body).toMatchObject({ total: 13, page: 1, limit: 5 });
            expect(res.body.items.map((u) => u.username)).toEqual(['guide-01', 'guide-02', 'guide-03', 'guide-04', 'guide-05']);
        });

        it('pages never overlap and cover everyone', async () => {
            const seen = [];
            for (let page = 1; page <= 3; page++) {
                const res = await get(`/users?page=${page}&limit=5&role=user`).expect(200);
                seen.push(...res.body.items.map((u) => u.id));
            }
            expect(new Set(seen).size).toBe(13);
        });

        it('sorts by a joined column, descending', async () => {
            const res = await get('/users?page=1&limit=20&role=user&sortBy=location&descending=true').expect(200);
            const names = res.body.items.map((u) => u.location.name);
            expect(names[0]).toBe('Beta');
            expect(names[names.length - 1]).toBe('Alpha');
        });

        it('ignores an unknown sort column', async () => {
            const res = await get('/users?page=1&limit=3&role=user&sortBy=password').expect(200);
            expect(res.body.items[0].username).toBe('guide-01');
        });

        it('filters by location and search, taking wildcards literally', async () => {
            const byLoc = await get(`/users?page=1&locationId=${locB.id}`).expect(200);
            expect(byLoc.body.total).toBe(5);

            const literal = await get('/users?page=1&search=%25').expect(200);
            expect(literal.body.items.map((u) => u.username)).toEqual(['odd_name%']);

            const caseless = await get('/users?page=1&search=GUIDE-1').expect(200);
            expect(caseless.body.total).toBe(3);
        });

        it('sends progress as counts, not rows', async () => {
            const res = await get(`/users?page=1&search=guide-01`).expect(200);
            const [user] = res.body.items;
            expect(user.unit.name).toBe('Eagles');
            expect(user.progress.currentPeak).toBeTruthy();
            expect(user.progress).toMatchObject({ pathCount: 1, guideDiplomaCount: 0, electiveDiplomaCount: 0 });
            expect(user.progress).not.toHaveProperty('completedPaths');
            expect(user).not.toHaveProperty('password');
        });

        it('keeps a location admin to their location on every page', async () => {
            const res = await get(`/users?page=1&limit=50&locationId=${locB.id}`, adminAToken).expect(200);
            expect(res.body.items.every((u) => u.location?.id === locA.id)).toBe(true);
        });

        it('rejects a page size over the limit', () => {
            return get('/users?page=1&limit=1000').expect(400);
        });
    });

    describe('GET /units', () => {
        it('pages units with member counts', async () => {
            const res = await get('/units?page=1&limit=1').expect(200);
            expect(res.body.total).toBe(2);
            expect(res.body.items[0]).toMatchObject({ name: 'Eagles', memberCount: 1, location: { name: 'Alpha' } });
            expect(res.body.items[0]).not.toHaveProperty('users');
        });

        it('keeps a location admin to their units', async () => {
            const res = await get('/units?page=1', adminAToken).expect(200);
            expect(res.body.items.map((u) => u.name)).toEqual(['Eagles']);
        });
    });

    describe('GET /locations', () => {
        it('pages and searches locations', async () => {
            const res = await get('/locations?page=1&limit=10&search=bet').expect(200);
            expect(res.body.total).toBe(1);
            expect(res.body.items[0].name).toBe('Beta');
        });

        it('counts unit members in the overview', async () => {
            const res = await get(`/locations/${locA.id}/overview`).expect(200);
            expect(res.body.units).toEqual([expect.objectContaining({ name: 'Eagles', memberCount: 1 })]);
        });
    });
});
