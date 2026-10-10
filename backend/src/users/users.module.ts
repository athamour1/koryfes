import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Unit } from '../units/entities/unit.entity';
import { LocationsModule } from '../locations/locations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Unit]),
        LocationsModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService, TypeOrmModule],
})
export class UsersModule { }
