import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgressService } from './user-progress.service';
import { UserProgressController } from './user-progress.controller';
import { UserProgress } from './user-progress.entity';
import { Peak } from '../peaks/peak.entity';
import { Path } from '../paths/path.entity';
import { GuideDiploma } from '../guide-diplomas/guide-diploma.entity';
import { ElectiveDiploma } from '../elective-diplomas/elective-diploma.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserProgress,
            Peak,
            Path,
            GuideDiploma,
            ElectiveDiploma,
            User,
        ]),
    ],
    controllers: [UserProgressController],
    providers: [UserProgressService],
    exports: [UserProgressService],
})
export class UserProgressModule { }
