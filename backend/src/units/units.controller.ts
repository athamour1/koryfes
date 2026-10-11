import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException, BadRequestException, UseInterceptors, UploadedFile, Query, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UnitsService } from './units.service';
import { imageUploadOptions } from '../common/image-upload';
import { UnitPhotosService } from './unit-photos.service';
import { UNIT_PHOTO_KINDS, UnitPhotoKind } from './entities/unit-photo.entity';
import { assertCanEditUnit } from './unit-access';
import { UnitsQueryDto } from './dto/units-query.dto';

@Controller('units')
export class UnitsController {
    constructor(
        private readonly unitsService: UnitsService,
        private readonly unitPhotos: UnitPhotosService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async create(@Body() createUnitDto: any, @Request() req) {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            throw new UnauthorizedException('Only admins can create units');
        }

        // If Admin, force location to their location
        if (req.user.role === 'admin') {
            if (!req.user.locationId) {
                throw new UnauthorizedException('Admin has no location assigned');
            }
            createUnitDto.location = { id: req.user.locationId };
        }

        return this.unitsService.create(createUnitDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Query() query: UnitsQueryDto, @Request() req) {
        // Admins and plain users only see the units of their own location
        if (req.user.role === 'admin' || (req.user.role === 'user' && req.user.locationId)) {
            query.locationId = req.user.locationId;
        }

        return this.unitsService.findAll(query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        // Any signed-in user may view any unit (the community shows Guides of
        // every location); changing a unit is checked by assertCanEditUnit
        return this.unitsService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateUnitDto: any, @Request() req) {
        const unitId = id;
        const unit = await this.unitsService.findOne(unitId);
        assertCanEditUnit(req.user, unit);

        // The flag only changes through POST /units/:id/image: its old object is
        // deleted on replace, so a hand-set path could point at someone else's
        delete updateUnitDto.flag;

        if (req.user.role === 'admin') {
            // Prevent changing location
            delete updateUnitDto.location;
        }

        if (req.user.role === 'user') {
            // Unit Leaders can only update description
            const allowedUpdates = ['description'];
            const invalidUpdates = Object.keys(updateUnitDto).filter(key => !allowedUpdates.includes(key));

            if (invalidUpdates.length > 0) {
                throw new UnauthorizedException('Unit Leaders can only update the description');
            }
        }

        return this.unitsService.update(unitId, updateUnitDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            throw new UnauthorizedException('Only admins can delete units');
        }

        const unit = await this.unitsService.findOne(id);

        if (req.user.role === 'admin') {
            if (unit.location.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only delete units in your location');
            }
        }

        return this.unitsService.remove(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/image')
    @UseInterceptors(FileInterceptor('file', imageUploadOptions()))
    async uploadFlag(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: any, @Request() req) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const unit = await this.unitsService.findOne(id);
        assertCanEditUnit(req.user, unit);

        return this.unitsService.updateFlag(id, file.buffer);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/photos')
    @UseInterceptors(FileInterceptor('file', imageUploadOptions()))
    async addPhoto(@Param('id', ParseIntPipe) id: number, @Query('kind') kind: string, @UploadedFile() file: any, @Request() req) {
        if (!UNIT_PHOTO_KINDS.includes(kind as UnitPhotoKind)) {
            throw new BadRequestException('kind must be corner or activity');
        }
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const unit = await this.unitsService.findOne(id);
        assertCanEditUnit(req.user, unit);
        return this.unitPhotos.add(unit, kind as UnitPhotoKind, file.buffer);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/photos/:photoId')
    async removePhoto(@Param('id', ParseIntPipe) id: number, @Param('photoId', ParseIntPipe) photoId: number, @Request() req) {
        const unit = await this.unitsService.findOne(id);
        assertCanEditUnit(req.user, unit);
        await this.unitPhotos.remove(unit.id, photoId);
        return { ok: true };
    }
}
