import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, PASSWORD, seedUser } from './helpers';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
        await seedUser(app as any, 'loginuser');
    });

    afterAll(async () => {
        await app?.close();
    });

    describe('/auth/register (POST)', () => {
        it('no longer exists: users are created by admins', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({ username: 'attacker', password: PASSWORD, role: 'super_admin' })
                .expect(404);
        });
    });

    describe('/auth/login (POST)', () => {
        it('should login successfully with valid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'loginuser', password: PASSWORD })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('access_token');
                    expect(res.body).toHaveProperty('user');
                    expect(res.body.user).toHaveProperty('username', 'loginuser');
                });
        });

        it('should fail with invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'loginuser', password: 'WrongPassword' })
                .expect(401);
        });

        it('should reject a malformed body', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'loginuser' })
                .expect(400);
        });
    });

    describe('password reset', () => {
        it('rejects a reset without a token instead of matching the first user', () => {
            return request(app.getHttpServer())
                .post('/auth/reset-password')
                .send({ password: 'Hijacked123' })
                .expect(400);
        });

        it('rejects an unknown token', () => {
            return request(app.getHttpServer())
                .post('/auth/reset-password')
                .send({ token: 'not-a-real-token', password: 'Hijacked123' })
                .expect(401);
        });

        it('resets the password with the issued token, once', async () => {
            const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
            await request(app.getHttpServer())
                .post('/auth/forgot-password')
                .send({ email: 'loginuser' })
                .expect(201);
            const line = log.mock.calls.map((c) => String(c[0])).find((l) => l.includes('[MOCK EMAIL]'));
            log.mockRestore();

            const token = line!.split(': ').pop()!;
            expect(token).toMatch(/^[0-9a-f]{64}$/);

            await request(app.getHttpServer())
                .post('/auth/reset-password')
                .send({ token, password: 'NewPassword123' })
                .expect(201);

            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'loginuser', password: 'NewPassword123' })
                .expect(201);

            // Token is single-use
            await request(app.getHttpServer())
                .post('/auth/reset-password')
                .send({ token, password: 'Again123456' })
                .expect(401);
        });
    });
});
