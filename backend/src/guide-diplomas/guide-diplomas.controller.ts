import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuideDiplomasService } from './guide-diplomas.service';
import { GuideDiploma } from './guide-diploma.entity';

// Read-only: the catalog cannot be changed through the API
@Controller('guide-diplomas')
@UseGuards(JwtAuthGuard)
export class GuideDiplomasController {
    constructor(private readonly service: GuideDiplomasService) { }

    @Get()
    findAll(): Promise<GuideDiploma[]> {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<GuideDiploma> {
        return this.service.findOne(id);
    }
}
