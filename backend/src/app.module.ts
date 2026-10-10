import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { UnitsModule } from './units/units.module';
import { PeaksModule } from './peaks/peaks.module';
import { PathsModule } from './paths/paths.module';
import { GuideDiplomasModule } from './guide-diplomas/guide-diplomas.module';
import { ElectiveDiplomasModule } from './elective-diplomas/elective-diplomas.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { CatalogModule } from './catalog/catalog.module';
import { StorageModule } from './storage/storage.module';

const isSqlite = process.env.DB_TYPE === 'sqlite';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as any) || 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'guide_badges',
      autoLoadEntities: true,
      // Postgres schema is managed by migrations (src/migrations); the local
      // SQLite dev database is still synchronized from the entities
      synchronize: isSqlite,
      migrations: isSqlite ? [] : [join(__dirname, 'migrations', '*.js')],
      migrationsRun: !isSqlite,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: parseInt(process.env.THROTTLE_LIMIT) || 100, // requests per minute per IP
    }]),
    UsersModule,
    AuthModule,
    LocationsModule,
    UnitsModule,
    PeaksModule,
    PathsModule,
    GuideDiplomasModule,
    ElectiveDiplomasModule,
    UserProgressModule,
    CatalogModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }


