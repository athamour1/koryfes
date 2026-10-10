import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { UserRole } from './../src/users/entities/user.entity';
import { createTestApp, login, seedLocation, seedUser } from './helpers';

describe('Individual progress (e2e)', () => {
    let app: NestExpressApplication;
    let superToken: string;
    let adminToken: string;
    let guideToken: string;
    let guide: { id: number };
    let catalog: { peaks: any[]; paths: any[]; guide: any[]; electives: any[] };

    const http = () => request(app.getHttpServer());
    const as = (token: string) => (req: request.Test) => req.set('Authorization', `Bearer ${token}`);

    beforeAll(async () => {
        app = await createTestApp();
        const loc = await seedLocation(app, 'Loc');
        await seedUser(app, 'super', UserRole.SUPER_ADMIN);
        await seedUser(app, 'leader', UserRole.ADMIN, loc);
        guide = await seedUser(app, 'guide', UserRole.USER, loc);
        superToken = await login(app, 'super');
        adminToken = await login(app, 'leader');
        guideToken = await login(app, 'guide');

        const get = async (url: string) => (await as(guideToken)(http().get(url)).expect(200)).body;
        catalog = {
            peaks: await get('/peaks'),
            paths: await get('/paths'),
            guide: await get('/guide-diplomas'),
            electives: await get('/elective-diplomas'),
        };
    });

    afterAll(async () => {
        await app?.close();
    });

    describe('catalog', () => {
        it('serves the fixed catalog from the book', () => {
            expect(catalog.peaks.map((p) => p.code)).toEqual(['promise', 'bronze', 'silver', 'gold']);
            expect(catalog.paths).toHaveLength(123);
            expect(catalog.guide.map((d) => d.code)).toEqual(['odigismou-a', 'odigismou-b', 'odigismou-g']);
            expect(catalog.electives).toHaveLength(70);
            expect(catalog.electives[0]).toMatchObject({ code: '01-a-voitheion', number: 1, name: "Πτυχίο Α' Βοηθειών" });
            expect(catalog.electives[0].requirements).toHaveLength(7);
        });

        it.each(['/peaks', '/paths', '/guide-diplomas', '/elective-diplomas'])('%s cannot be changed, even by a super admin', async (url) => {
            await as(superToken)(http().post(url)).send({ name: 'x' }).expect(404);
            await as(superToken)(http().patch(`${url}/1`)).send({ name: 'x' }).expect(404);
            await as(superToken)(http().delete(`${url}/1`)).expect(404);
        });
    });

    describe('awarding', () => {
        const award = (path: string, body?: object) =>
            as(adminToken)(http().post(`/users/${guide.id}/progress/${path}`)).send(body ?? {}).expect(201);
        const pathOf = (category: string, n = 1) => catalog.paths.filter((p) => p.category === category)[n - 1].id;
        const chapters = ['me_and_my_capabilities', 'society_and_volunteering', 'nature', 'arts'];

        it('the location leader gives the Promise', async () => {
            const res = await award('promise');
            expect(res.body.currentPeak.code).toBe('promise');
        });

        it('bronze is earned automatically with 4 paths, Guiding Α\' and 1 diploma', async () => {
            for (const c of chapters.slice(0, 3)) {
                await award('paths', { pathId: pathOf(c) });
            }
            await award('diplomas', { type: 'guide', diplomaId: catalog.guide[0].id });
            let res = await award('diplomas', { type: 'elective', diplomaId: catalog.electives[0].id });
            expect(res.body.currentPeak.code).toBe('promise'); // only 3 of 4 paths

            res = await award('paths', { pathId: pathOf('arts') });
            expect(res.body.currentPeak.code).toBe('bronze');
            expect(res.body.evaluation.peaks[1].met).toBe(true);
        });

        it('the guide sees the same progress and what is missing for the next peak', async () => {
            const res = await as(guideToken)(http().get('/user-progress/me')).expect(200);
            expect(res.body.currentPeak.code).toBe('bronze');
            const silver = res.body.evaluation.peaks.find((p) => p.type === 'silver');
            expect(silver.met).toBe(false);
            expect(silver.requirements.filter((r) => !r.met).map((r) => r.key)).toContain('guideDiploma');
        });

        it('removing a mistaken award recomputes the peak', async () => {
            const res = await as(adminToken)(http().delete(`/users/${guide.id}/progress/paths/${pathOf('arts')}`)).expect(200);
            expect(res.body.currentPeak.code).toBe('promise');
            await award('paths', { pathId: pathOf('arts') });
        });

        it('rejects duplicates and unknown entries', async () => {
            await as(adminToken)(http().post(`/users/${guide.id}/progress/paths`)).send({ pathId: pathOf('arts') }).expect(400);
            await as(adminToken)(http().post(`/users/${guide.id}/progress/paths`)).send({ pathId: 99999 }).expect(404);
            await as(adminToken)(http().post(`/users/${guide.id}/progress/diplomas`)).send({ diplomaId: 1, type: 'nope' }).expect(400);
        });

        it('peaks cannot be awarded by hand', async () => {
            await as(superToken)(http().post(`/users/${guide.id}/progress/peak`)).send({ peakId: 4 }).expect(404);
        });
    });
});
