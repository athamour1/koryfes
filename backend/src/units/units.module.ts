import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { Unit } from './entities/unit.entity';
import { UnitPhoto } from './entities/unit-photo.entity';
import { UnitPhotosService } from './unit-photos.service';

@Module({
    imports: [TypeOrmModule.forFeature([Unit, UnitPhoto])],
    controllers: [UnitsController],
    providers: [UnitsService, UnitPhotosService],
    exports: [UnitsService],
})
export class UnitsModule { }
