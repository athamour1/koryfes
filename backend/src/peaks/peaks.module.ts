import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Peak } from './peak.entity';
import { PeaksController } from './peaks.controller';
import { PeaksService } from './peaks.service';

@Module({
    imports: [TypeOrmModule.forFeature([Peak])],
    controllers: [PeaksController],
    providers: [PeaksService],
    exports: [PeaksService],
})
export class PeaksModule { }
