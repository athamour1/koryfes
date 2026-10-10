import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserRole } from './../src/users/entities/user.entity';
import { createTestApp, login, seedLocation, seedUser } from './helpers';

describe('LocationsController (e2e)', () => {
    let app: INestApplication;
    let superAdminToken: string;
    let userToken: string;
    let locationId: number;

    beforeAll(async () => {
        app = await createTestApp();

        await seedUser(app as any, 'superadmin', UserRole.SUPER_ADMIN);
        await seedUser(app as any, 'regularuser', UserRole.USER);
        superAdminToken = await login(app as any, 'superadmin');
        userToken = await login(app as any, 'regularuser');

        locationId = (await seedLocation(app as any, 'Delete Me')).id;
    });

    afterAll(async () => {
        await app?.close();
    });

    describe('DELETE /locations/:id', () => {
        it('should fail for unauthenticated user', () => {
            return request(app.getHttpServer())
                .delete(`/locations/${locationId}`)
                .expect(401);
        });

        it('should fail for regular user', () => {
            return request(app.getHttpServer())
                .delete(`/locations/${locationId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });

        it('should succeed for super admin', () => {
            return request(app.getHttpServer())
                .delete(`/locations/${locationId}`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .expect(200);
        });
    });
});
