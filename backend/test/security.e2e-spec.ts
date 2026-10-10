import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { UserRole } from './../src/users/entities/user.entity';
import { UsersService } from './../src/users/users.service';
import { createTestApp, login, PASSWORD, seedLocation, seedUnit, seedUser } from './helpers';

describe('Security regressions (e2e)', () => {
    let app: NestExpressApplication;
    let users: UsersService;
    let superToken: string;
    let adminAToken: string;
    let userAToken: string;
    let userA: { id: number };
    let userB: { id: number };
    let userC: { id: number };
    let unitB: { id: number };

    const http = () => request(app.getHttpServer());

    beforeAll(async () => {
        app = await createTestApp();
        users = app.get(UsersService);

        const locA = await seedLocation(app, 'Location A');
        const locB = await seedLocation(app, 'Location B');
        unitB = await seedUnit(app, 'Unit B', locB);

        await seedUser(app, 'super', UserRole.SUPER_ADMIN);
        await seedUser(app, 'adminA', UserRole.ADMIN, locA);
        userA = await seedUser(app, 'userA', UserRole.USER, locA);
        userB = await seedUser(app, 'userB', UserRole.USER, locB);
        userC = await seedUser(app, 'userC', UserRole.USER, locA);

        superToken = await login(app, 'super');
        adminAToken = await login(app, 'adminA');
        userAToken = await login(app, 'userA');
    });

    afterAll(async () => {
        await app?.close();
    });

    describe('PATCH /users/profile', () => {
        it('rejects a user promoting themselves', async () => {
            await http()
                .patch('/users/profile')
                .set('Authorization', `Bearer ${userAToken}`)
                .send({ role: 'super_admin', isAdmin: true })
                .expect(400);
            expect((await users.findOne(userA.id)).role).toBe(UserRole.USER);
        });

        it('still allows editing the avatar', () => {
            return http()
                .patch('/users/profile')
                .set('Authorization', `Bearer ${userAToken}`)
                .send({ avatarConfig: { skin: 'light' } })
                .expect(200);
        });
    });

    describe('PATCH /users/:id', () => {
        it('ignores role changes from a location admin', async () => {
            await http()
                .patch(`/users/${userA.id}`)
                .set('Authorization', `Bearer ${adminAToken}`)
                .send({ role: 'super_admin', username: 'userA' })
                .expect(200);
            expect((await users.findOne(userA.id)).role).toBe(UserRole.USER);
        });

        it('rejects assigning a unit from another location', () => {
            return http()
                .patch(`/users/${userA.id}`)
                .set('Authorization', `Bearer ${adminAToken}`)
                .send({ unit: { id: unitB.id }, unitRole: 'member' })
                .expect(401);
        });

        it('lets a super admin change roles and keeps isAdmin in sync', async () => {
            await http()
                .patch(`/users/${userC.id}`)
                .set('Authorization', `Bearer ${superToken}`)
                .send({ role: 'admin' })
                .expect(200);
            const updated = await users.findOne(userC.id);
            expect(updated.role).toBe(UserRole.ADMIN);
            expect(updated.isAdmin).toBe(true);
        });
    });

    describe('POST /users', () => {
        it('forces location admins to create plain users', async () => {
            const res = await http()
                .post('/users')
                .set('Authorization', `Bearer ${adminAToken}`)
                .send({ username: 'sneaky', password: PASSWORD, role: 'super_admin' })
                .expect(201);
            expect(res.body.user.role).toBe(UserRole.USER);
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('rejects a unit from another location', () => {
            return http()
                .post('/users')
                .set('Authorization', `Bearer ${adminAToken}`)
                .send({ username: 'sneaky2', password: PASSWORD, unitId: unitB.id })
                .expect(401);
        });

        it('rejects plain users', () => {
            return http()
                .post('/users')
                .set('Authorization', `Bearer ${userAToken}`)
                .send({ username: 'nope', password: PASSWORD })
                .expect(401);
        });
    });

    describe('GET /users/:id', () => {
        it('requires login', () => {
            return http().get(`/users/${userA.id}`).expect(401);
        });

        it('never returns password or reset token', async () => {
            const res = await http()
                .get(`/users/${userA.id}`)
                .set('Authorization', `Bearer ${userAToken}`)
                .expect(200);
            expect(res.body).not.toHaveProperty('password');
            expect(res.body).not.toHaveProperty('resetPasswordToken');
        });
    });

    describe('/users/:id/progress', () => {
        it('blocks a location admin from changing progress in another location', async () => {
            await http()
                .post(`/users/${userB.id}/progress/promise`)
                .set('Authorization', `Bearer ${adminAToken}`)
                .expect(403);
            await http()
                .post(`/users/${userB.id}/progress/paths`)
                .set('Authorization', `Bearer ${adminAToken}`)
                .send({ pathId: 1 })
                .expect(403);
            await http()
                .post(`/users/${userB.id}/progress/diplomas`)
                .set('Authorization', `Bearer ${adminAToken}`)
                .send({ diplomaId: 1, type: 'elective' })
                .expect(403);
        });

        it('blocks plain users from awarding themselves', () => {
            return http()
                .post(`/users/${userA.id}/progress/promise`)
                .set('Authorization', `Bearer ${userAToken}`)
                .expect(403);
        });
    });

    describe('POST /units/:id/image', () => {
        it('rejects non-image uploads', () => {
            return http()
                .post(`/units/${unitB.id}/image`)
                .set('Authorization', `Bearer ${superToken}`)
                .attach('file', Buffer.from('<script>alert(1)</script>'), {
                    filename: 'flag.html',
                    contentType: 'text/html',
                })
                .expect(400);
        });
    });
});
