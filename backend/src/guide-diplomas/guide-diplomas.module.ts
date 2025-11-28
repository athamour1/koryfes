import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuideDiploma } from './guide-diploma.entity';
import { GuideDiplomasController } from './guide-diplomas.controller';
import { GuideDiplomasService } from './guide-diplomas.service';

@Module({
    imports: [TypeOrmModule.forFeature([GuideDiploma])],
    controllers: [GuideDiplomasController],
    providers: [GuideDiplomasService],
    exports: [GuideDiplomasService],
})
export class GuideDiplomasModule { }
