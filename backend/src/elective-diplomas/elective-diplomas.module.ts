import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectiveDiploma } from './elective-diploma.entity';
import { ElectiveDiplomasController } from './elective-diplomas.controller';
import { ElectiveDiplomasService } from './elective-diplomas.service';

@Module({
    imports: [TypeOrmModule.forFeature([ElectiveDiploma])],
    controllers: [ElectiveDiplomasController],
    providers: [ElectiveDiplomasService],
    exports: [ElectiveDiplomasService],
})
export class ElectiveDiplomasModule { }
