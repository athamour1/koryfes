import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Path } from './path.entity';
import { PathsController } from './paths.controller';
import { PathsService } from './paths.service';

@Module({
    imports: [TypeOrmModule.forFeature([Path])],
    controllers: [PathsController],
    providers: [PathsService],
    exports: [PathsService],
})
export class PathsModule { }
