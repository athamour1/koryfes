import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoutDiploma } from './scout-diploma.entity';
import { ScoutDiplomasController } from './scout-diplomas.controller';
import { ScoutDiplomasService } from './scout-diplomas.service';

@Module({
    imports: [TypeOrmModule.forFeature([ScoutDiploma])],
    controllers: [ScoutDiplomasController],
    providers: [ScoutDiplomasService],
    exports: [ScoutDiplomasService],
})
export class ScoutDiplomasModule { }
