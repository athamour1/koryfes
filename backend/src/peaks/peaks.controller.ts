import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PeaksService } from './peaks.service';
import { Peak } from './peak.entity';

// Read-only: the catalog cannot be changed through the API
@Controller('peaks')
@UseGuards(JwtAuthGuard)
export class PeaksController {
    constructor(private readonly service: PeaksService) { }

    @Get()
    findAll(): Promise<Peak[]> {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Peak> {
        return this.service.findOne(id);
    }
}
