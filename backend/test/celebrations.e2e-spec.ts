import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { UserRole } from './../src/users/entities/user.entity';
import { createTestApp, login, seedLocation, seedUser } from './helpers';

describe('Milestone celebrations (e2e)', () => {
    let app: NestExpressApplication;
    let adminToken: string;
    let guideToken: string;
    let guide: { id: number };
    let electives: { id: number }[];

    const http = () => request(app.getHttpServer());
    const as = (token: string) => (req: request.Test) => req.set('Authorization', `Bearer ${token}`);
    const me = async () => (await as(guideToken)(http().get('/user-progress/me')).expect(200)).body;
    const celebrate = async () => (await as(guideToken)(http().post('/user-progress/me/celebrated')).expect(201)).body;

    beforeAll(async () => {
        app = await createTestApp();
        const loc = await seedLocation(app, 'Celebrations');
        await seedUser(app, 'celebrationLeader', UserRole.ADMIN, loc);
        guide = await seedUser(app, 'celebrationGuide', UserRole.USER, loc);
        adminToken = await login(app, 'celebrationLeader');
        guideToken = await login(app, 'celebrationGuide');
        electives = (await as(guideToken)(http().get('/elective-diplomas')).expect(200)).body;
    });

    afterAll(async () => {
        await app?.close();
    });

    it('starts with nothing celebrated', async () => {
        const progress = await me();
        expect(progress.celebratedPeakOrder).toBe(0);
        expect(progress.celebratedElectiveIds ?? []).toEqual([]);
    });

    it('keeps an award pending until the Guide has seen it, then records it', async () => {
        await as(adminToken)(http().post(`/users/${guide.id}/progress/promise`)).expect(201);
        await as(adminToken)(http().post(`/users/${guide.id}/progress/diplomas`))
            .send({ diplomaId: electives[0].id, type: 'elective' })
            .expect(201);

        const pending = await me();
        expect(pending.currentPeak.order).toBe(1);
        expect(pending.celebratedPeakOrder).toBe(0);

        const seen = await celebrate();
        expect(seen.celebratedPeakOrder).toBe(1);
        expect(seen.celebratedElectiveIds).toEqual([electives[0].id]);
        expect((await me()).celebratedPeakOrder).toBe(1);
    });

    it('lowers what was celebrated when a milestone is taken back, so it can be celebrated again', async () => {
        await as(adminToken)(http().delete(`/users/${guide.id}/progress/promise`)).expect(200);
        const progress = await me();
        expect(progress.currentPeak).toBeNull();
        expect(progress.celebratedPeakOrder).toBe(0);
    });

    it('only lets a Guide record their own celebrations', () => {
        return http().post('/user-progress/me/celebrated').expect(401);
    });
});
