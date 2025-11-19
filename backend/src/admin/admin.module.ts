import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { BadgesModule } from '../badges/badges.module';

@Module({
    imports: [UsersModule, BadgesModule],
    controllers: [AdminController],
})
export class AdminModule { }
