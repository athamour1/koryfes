import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PageQueryDto } from '../common/pagination';

@Controller('locations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    @Post()
    create(@Body() createLocationDto: CreateLocationDto) {
        return this.locationsService.create(createLocationDto);
    }

    @Get()
    findAll(@Query() query: PageQueryDto) {
        return this.locationsService.findAll(query);
    }

    // Every signed-in user may look at a local group and its units (read only)
    @Get(':id/overview')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER)
    overview(@Param('id', ParseIntPipe) id: number) {
        return this.locationsService.overview(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.locationsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
        return this.locationsService.update(+id, updateLocationDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.locationsService.remove(+id);
    }
}
