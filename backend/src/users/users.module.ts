import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => UserProgressModule),
        LocationsModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService, TypeOrmModule],
})
export class UsersModule { }
