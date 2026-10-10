import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { UsersService } from '../src/users/users.service';
import { UserRole } from '../src/users/entities/user.entity';
import { Location } from '../src/locations/entities/location.entity';
import { Unit } from '../src/units/entities/unit.entity';

export const PASSWORD = 'Password123!';

export async function createTestApp(): Promise<NestExpressApplication> {
    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    return app;
}

export async function seedLocation(app: NestExpressApplication, name: string): Promise<Location> {
    return app.get(DataSource).getRepository(Location).save({ name });
}

export async function seedUnit(app: NestExpressApplication, name: string, location: Location): Promise<Unit> {
    return app.get(DataSource).getRepository(Unit).save({ name, location });
}

export async function seedUser(
    app: NestExpressApplication,
    username: string,
    role: UserRole = UserRole.USER,
    location?: Location,
) {
    const { user } = await app.get(UsersService).create({
        username,
        password: PASSWORD,
        role,
        location,
    });
    return user;
}

export async function login(app: NestExpressApplication, username: string, password = PASSWORD): Promise<string> {
    const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username, password })
        .expect(201);
    return res.body.access_token;
}
