import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UnauthorizedException, UseInterceptors, UploadedFile, Inject, forwardRef } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UserProgressService } from '../user-progress/user-progress.service';
import { UnitRole, UserRole } from './entities/user.entity';
import { AdminUpdateUserDto, CreateUserDto, UpdateProfileDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => UserProgressService))
        private readonly userProgressService: UserProgressService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.findOne(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
        return this.usersService.update(req.user.userId, updateData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Query('locationId') locationId: string, @Query('name') name: string, @Request() req) {
        let locId = locationId ? +locationId : undefined;

        // If the user is a captain (admin role), force location filter to their location
        if (req.user.role === 'admin') {
            if (!req.user.locationId) {
                throw new UnauthorizedException('Admin has no location assigned');
            }
            // Override any locationId query param with admin's location
            locId = req.user.locationId;
        }

        return this.usersService.findAll(locId, name);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async create(@Body() createUserDto: CreateUserDto, @Request() req) {
        const userRole = req.user.role;
        if (userRole !== 'super_admin' && userRole !== 'admin') {
            throw new UnauthorizedException('Insufficient permissions');
        }

        // If Admin, force location to their location
        if (userRole === 'admin') {
            // We need to get the admin's location. 
            // req.user.locationId should be there if we put it in JWT.
            if (!req.user.locationId) {
                throw new UnauthorizedException('Admin has no location assigned');
            }
            createUserDto.location = { id: req.user.locationId };
            delete createUserDto.locationName;
            // Admin can only create USER role
            createUserDto.role = UserRole.USER;

            if (createUserDto.unitId) {
                await this.assertUnitInLocation(createUserDto.unitId, req.user.locationId);
            }
        }

        const { unitId, ...userData } = createUserDto;
        return this.usersService.create({
            ...userData,
            ...(unitId ? { unit: { id: unitId } } : {}),
        } as any);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async updateUser(@Param('id') id: string, @Body() updateData: AdminUpdateUserDto, @Request() req) {
        if (!req.user.isAdmin && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new UnauthorizedException('Only admins can update users');
        }

        // If Admin (not Super Admin), verify user is in same location
        if (req.user.role === 'admin') {
            const targetUser = await this.usersService.findOne(+id);
            if (!targetUser) {
                throw new UnauthorizedException('User not found');
            }
            if (targetUser.location?.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only update users in your location');
            }
            if (targetUser.role !== 'user') {
                throw new UnauthorizedException('You can only update simple users');
            }

            // Admins can't move users to another location or change roles;
            // drop those fields so the rest of the update still applies
            delete updateData.locationName;
            delete updateData.role;

            if (updateData.unit?.id) {
                await this.assertUnitInLocation(updateData.unit.id, req.user.locationId);
            }
        }

        return this.usersService.update(+id, updateData as any);
    }

    private async assertUnitInLocation(unitId: number, locationId: number) {
        const unitLocationId = await this.usersService.getUnitLocationId(unitId);
        if (unitLocationId !== locationId) {
            throw new UnauthorizedException('You can only assign units in your location');
        }
    }





    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteUser(@Param('id') id: string, @Request() req) {
        if (!req.user.isAdmin && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new UnauthorizedException('Only admins can delete users');
        }

        // Prevent users from deleting themselves
        if (+id === req.user.userId) {
            throw new UnauthorizedException('You cannot delete yourself');
        }

        // If Admin (not Super Admin), verify user is in same location
        if (req.user.role === 'admin') {
            const targetUser = await this.usersService.findOne(+id);
            if (!targetUser) {
                throw new UnauthorizedException('User not found');
            }
            if (targetUser.location?.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only delete users in your location');
            }
            if (targetUser.role !== 'user') {
                throw new UnauthorizedException('You can only delete simple users');
            }
        }

        await this.usersService.remove(+id);
        return { message: 'User deleted successfully' };
    }

    /**
     * User Progress Endpoints
     * These match the frontend API calls
     */

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/progress')
    async getUserProgress(@Param('id') id: string, @Request() req) {
        const targetUserId = +id;
        const requestingUser = await this.usersService.findOne(req.user.userId);
        const targetUser = await this.usersService.findOne(targetUserId);

        // Allow if:
        // 1. User viewing their own progress
        // 2. Admin or Super Admin
        // 3. Unit leader/deputy viewing member of their unit
        const isSelf = req.user.userId === targetUserId;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
        const isUnitLeader = requestingUser?.unitRole === UnitRole.LEADER || requestingUser?.unitRole === UnitRole.DEPUTY_LEADER;
        const sameUnit = requestingUser?.unit?.id && targetUser?.unit?.id &&
            requestingUser.unit.id === targetUser.unit.id;

        if (!isSelf && !isAdmin && !(isUnitLeader && sameUnit)) {
            throw new UnauthorizedException('Insufficient permissions to view this user\'s progress');
        }

        return this.userProgressService.getUserProgress(targetUserId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/progress/peak')
    async awardPeakToUser(
        @Param('id') id: string,
        @Body() body: { peakName?: string; peakId?: number },
        @Request() req
    ) {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            throw new UnauthorizedException('Only admins can award peaks');
        }

        // If Admin (not Super Admin), verify user is in same location
        if (req.user.role === 'admin') {
            const targetUser = await this.usersService.findOne(+id);
            if (!targetUser) {
                throw new UnauthorizedException('User not found');
            }
            if (targetUser.location?.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only award peaks to users in your location');
            }
        }

        // If peakName is provided, find the peak by name
        let peakId = body.peakId;
        if (body.peakName && !peakId) {
            const peak = await this.userProgressService.findPeakByName(body.peakName);
            if (!peak) {
                throw new UnauthorizedException(`Peak "${body.peakName}" not found`);
            }
            peakId = peak.id;
        }

        if (!peakId) {
            throw new UnauthorizedException('Either peakName or peakId must be provided');
        }

        return this.userProgressService.awardPeak(+id, peakId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/progress/path')
    async awardPathToUser(
        @Param('id') id: string,
        @Body() body: { pathId: number },
        @Request() req
    ) {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            throw new UnauthorizedException('Only admins can award paths');
        }

        // If Admin (not Super Admin), verify user is in same location
        if (req.user.role === 'admin') {
            const targetUser = await this.usersService.findOne(+id);
            if (!targetUser) {
                throw new UnauthorizedException('User not found');
            }
            if (targetUser.location?.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only award paths to users in your location');
            }
        }

        return this.userProgressService.awardPath(+id, body.pathId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/progress/diploma')
    async awardDiplomaToUser(
        @Param('id') id: string,
        @Body() body: { diplomaId: number; type?: 'guide' | 'elective' },
        @Request() req
    ) {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            throw new UnauthorizedException('Only admins can award diplomas');
        }

        // If Admin (not Super Admin), verify user is in same location
        if (req.user.role === 'admin') {
            const targetUser = await this.usersService.findOne(+id);
            if (!targetUser) {
                throw new UnauthorizedException('User not found');
            }
            if (targetUser.location?.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only award diplomas to users in your location');
            }
        }

        // Default to 'elective' if not specified
        const type = body.type || 'elective';
        return this.userProgressService.awardDiploma(+id, body.diplomaId, type);
    }
}
