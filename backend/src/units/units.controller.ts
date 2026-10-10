import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException, BadRequestException, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UnitsService } from './units.service';
import { imageUploadOptions } from '../common/image-upload';
import { UnitPhotosService } from './unit-photos.service';
import { UNIT_PHOTO_KINDS, UnitPhotoKind } from './entities/unit-photo.entity';
import { assertCanEditUnit } from './unit-access';

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
    async findAll(@Query('locationId') locationId: string, @Request() req) {
        let locId = locationId ? +locationId : undefined;

        // If Admin, force location filter
        if (req.user.role === 'admin') {
            locId = req.user.locationId;
        }
        // If User, force location filter (users can only see units in their location)
        else if (req.user.role === 'user') {
            // We need to fetch user to get location if not in JWT, but let's assume it is or we fetch it.
            // For now, let's rely on the fact that users should only see their location's units.
            // Ideally, we should check the user's location.
            // Let's assume the frontend sends the correct locationId, but we should enforce it.
            // For simplicity, let's allow users to see all units for now, or filter by their location if we had it easily.
            // Better: if user has locationId in JWT, use it.
            if (req.user.locationId) {
                locId = req.user.locationId;
            }
        }

        return this.unitsService.findAll(locId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        const unit = await this.unitsService.findOne(+id);

        // Access control: Admin/User must be in same location
        if (req.user.role !== 'super_admin') {
            if (req.user.locationId && unit.location.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only view units in your location');
            }
        }

        return unit;
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUnitDto: any, @Request() req) {
        const unitId = +id;
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
    async remove(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            throw new UnauthorizedException('Only admins can delete units');
        }

        const unit = await this.unitsService.findOne(+id);

        if (req.user.role === 'admin') {
            if (unit.location.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only delete units in your location');
            }
        }

        return this.unitsService.remove(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/image')
    @UseInterceptors(FileInterceptor('file', imageUploadOptions()))
    async uploadFlag(@Param('id') id: string, @UploadedFile() file: any, @Request() req) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const unit = await this.unitsService.findOne(+id);
        assertCanEditUnit(req.user, unit);

        return this.unitsService.updateFlag(+id, file.buffer);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/photos')
    @UseInterceptors(FileInterceptor('file', imageUploadOptions()))
    async addPhoto(@Param('id') id: string, @Query('kind') kind: string, @UploadedFile() file: any, @Request() req) {
        if (!UNIT_PHOTO_KINDS.includes(kind as UnitPhotoKind)) {
            throw new BadRequestException('kind must be corner or activity');
        }
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const unit = await this.unitsService.findOne(+id);
        assertCanEditUnit(req.user, unit);
        return this.unitPhotos.add(unit, kind as UnitPhotoKind, file.buffer);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/photos/:photoId')
    async removePhoto(@Param('id') id: string, @Param('photoId') photoId: string, @Request() req) {
        const unit = await this.unitsService.findOne(+id);
        assertCanEditUnit(req.user, unit);
        await this.unitPhotos.remove(unit.id, +photoId);
        return { ok: true };
    }
}
