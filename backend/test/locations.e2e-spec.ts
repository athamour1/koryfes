import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './../src/auth/auth.module';
import { UsersModule } from './../src/users/users.module';
import { LocationsModule } from './../src/locations/locations.module';
import { UserProgressModule } from './../src/user-progress/user-progress.module';
import { User, UserRole } from './../src/users/entities/user.entity';
import { Location } from './../src/locations/entities/location.entity';
import { UserProgress } from './../src/user-progress/user-progress.entity';
import { Peak } from './../src/peaks/peak.entity';
import { Path } from './../src/paths/path.entity';
import { GuideDiploma } from './../src/guide-diplomas/guide-diploma.entity';
import { ElectiveDiploma } from './../src/elective-diplomas/elective-diploma.entity';
import { Unit } from './../src/units/entities/unit.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('LocationsController (e2e)', () => {
    let app: INestApplication;
    let superAdminToken: string;
    let userToken: string;
    let locationId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [
                        User,
                        Location,
                        UserProgress,
                        Peak,
                        Path,
                        GuideDiploma,
                        ElectiveDiploma,
                        Unit
                    ],
                    synchronize: true,
                }),
                AuthModule,
                UsersModule,
                LocationsModule,
                UserProgressModule
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        // Seed Users
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                username: 'superadmin',
                password: 'Password123!',
                role: UserRole.SUPER_ADMIN
            });

        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                username: 'regularuser',
                password: 'Password123!',
                role: UserRole.USER
            });

        // Login to get tokens
        const adminLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'superadmin', password: 'Password123!' });
        superAdminToken = adminLogin.body.access_token;

        const userLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'regularuser', password: 'Password123!' });
        userToken = userLogin.body.access_token;

        // Seed Location
        const locationRepo = app.get<Repository<Location>>(getRepositoryToken(Location));
        const location = locationRepo.create({ name: 'Delete Me' });
        const savedLocation = await locationRepo.save(location);
        locationId = savedLocation.id;
    });

    afterAll(async () => {
        await app.close();
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
