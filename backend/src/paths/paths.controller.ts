import { Controller, Get, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PathsService } from './paths.service';
import { Path } from './path.entity';
import { PathCategory } from './path-category.enum';

// Read-only: the catalog cannot be changed through the API
@Controller('paths')
@UseGuards(JwtAuthGuard)
export class PathsController {
    constructor(private readonly service: PathsService) { }

    @Get()
    findAll(@Query('category') category?: PathCategory): Promise<Path[]> {
        return this.service.findAll(category);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Path> {
        return this.service.findOne(id);
    }
}
