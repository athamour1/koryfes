import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ElectiveDiplomasService } from './elective-diplomas.service';
import { ElectiveDiploma } from './elective-diploma.entity';

// Read-only: the catalog cannot be changed through the API
@Controller('elective-diplomas')
@UseGuards(JwtAuthGuard)
export class ElectiveDiplomasController {
    constructor(private readonly service: ElectiveDiplomasService) { }

    @Get()
    findAll(): Promise<ElectiveDiploma[]> {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ElectiveDiploma> {
        return this.service.findOne(id);
    }
}
