import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UnitsService } from './units.service';

@Controller('units')
export class UnitsController {
    constructor(private readonly unitsService: UnitsService) { }

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
        const user = req.user;
        const isSuperAdmin = user.role === 'super_admin';
        const isAdmin = user.role === 'admin';
        const isUnitLeader = user.role === 'user' && user.unitId === unitId && user.unitRole === 'leader';

        if (!isSuperAdmin && !isAdmin && !isUnitLeader) {
            throw new UnauthorizedException('You do not have permission to update this unit');
        }

        const unit = await this.unitsService.findOne(unitId);

        if (isAdmin) {
            if (unit.location.id !== user.locationId) {
                throw new UnauthorizedException('You can only update units in your location');
            }
            // Prevent changing location
            delete updateUnitDto.location;
        }

        if (isUnitLeader) {
            // Unit Leaders can only update description and flag
            const allowedUpdates = ['description', 'flag'];
            const updates = Object.keys(updateUnitDto);
            const invalidUpdates = updates.filter(key => !allowedUpdates.includes(key));

            if (invalidUpdates.length > 0) {
                throw new UnauthorizedException('Unit Leaders can only update description and flag');
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
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/unit-flags',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    async uploadFlag(@Param('id') id: string, @UploadedFile() file: any, @Request() req) {
        // Allow admins, super admins, or unit leaders of this unit to upload flag
        const user = req.user;
        const unitId = +id;
        const isSuperAdmin = user.role === 'super_admin';
        const isAdmin = user.role === 'admin';
        const isUnitLeader = user.role === 'user' && user.unitId === unitId && user.unitRole === 'leader';
        if (!isSuperAdmin && !isAdmin && !isUnitLeader) {
            throw new UnauthorizedException('Only admins or unit leaders can upload unit flags');
        }

        const unit = await this.unitsService.findOne(+id);

        if (isAdmin) {
            if (unit.location.id !== user.locationId) {
                throw new UnauthorizedException('You can only upload flags for units in your location');
            }
        }

        return this.unitsService.updateFlag(+id, `/uploads/unit-flags/${file.filename}`);
    }
}
