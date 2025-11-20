import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { LocationsModule } from '../locations/locations.module';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), BadgesModule, LocationsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
