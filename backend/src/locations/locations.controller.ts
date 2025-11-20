import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

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
    findAll() {
        return this.locationsService.findAll();
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
