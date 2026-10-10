import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers';

describe('Rate limiting (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app?.close();
    });

    it('limits login attempts to 10 per minute per client', async () => {
        const statuses: number[] = [];
        for (let i = 0; i < 11; i++) {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'nobody', password: 'guess' + i });
            statuses.push(res.status);
        }
        expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
        expect(statuses[10]).toBe(429);
    });
});
