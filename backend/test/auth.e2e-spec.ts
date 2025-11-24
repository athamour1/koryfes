import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './../src/auth/auth.module';
import { UsersModule } from './../src/users/users.module';
import { User } from './../src/users/entities/user.entity';
import { Location } from './../src/locations/entities/location.entity';
import { LocationsModule } from './../src/locations/locations.module';
import { UserProgressModule } from './../src/user-progress/user-progress.module';
import { UserProgress } from './../src/user-progress/user-progress.entity';
import { Peak } from './../src/peaks/peak.entity';
import { Path } from './../src/paths/path.entity';
import { GuideDiploma } from './../src/guide-diplomas/guide-diploma.entity';
import { ElectiveDiploma } from './../src/elective-diplomas/elective-diploma.entity';
import { Unit } from './../src/units/entities/unit.entity';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

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
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/auth/register (POST)', () => {
        it('should register a new user', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    username: 'testuser_register',
                    password: 'Password123!',
                    locationName: 'Test Location'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('message', 'User created successfully');
        });

        it('should fail if username already exists', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    username: 'duplicateuser',
                    password: 'Password123!',
                })
                .expect(201);

            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    username: 'duplicateuser',
                    password: 'Password123!',
                })
                .expect(409);
        });
    });

    describe('/auth/login (POST)', () => {
        beforeAll(async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    username: 'loginuser',
                    password: 'Password123!',
                });
        });

        it('should login successfully with valid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    username: 'loginuser',
                    password: 'Password123!',
                })
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
                .send({
                    username: 'loginuser',
                    password: 'WrongPassword',
                })
                .expect(401);
        });
    });
});
