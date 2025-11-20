import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UnauthorizedException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.findOne(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    updateProfile(@Request() req, @Body() updateData: any) {
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
    async create(@Body() createUserDto: any, @Request() req) {
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
            // Admin can only create USER role
            createUserDto.role = 'user';
        }

        return this.usersService.create(createUserDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async updateUser(@Param('id') id: string, @Body() updateData: any, @Request() req) {
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

            // Prevent admin from changing location
            if (updateData.location || updateData.locationName || updateData.locationId) {
                // Instead of throwing error, just remove the fields to allow other updates
                delete updateData.location;
                delete updateData.locationName;
                delete updateData.locationId;
            }

            // Also remove isAdmin to prevent role escalation
            delete updateData.isAdmin;
        }

        // Handle badges update if provided as array of IDs
        if (updateData.badges && Array.isArray(updateData.badges)) {
            updateData.badges = updateData.badges.map(id => ({ id: +id }));
        }

        return this.usersService.update(+id, updateData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/badges')
    async assignBadge(@Param('id') id: string, @Body('badgeId') badgeId: number, @Request() req) {
        if (!req.user.isAdmin && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new UnauthorizedException('Only admins can assign badges');
        }

        // If Admin (not Super Admin), verify user is in same location
        if (req.user.role === 'admin') {
            const targetUser = await this.usersService.findOne(+id);
            if (!targetUser) {
                throw new UnauthorizedException('User not found');
            }
            if (targetUser.location?.id != req.user.locationId) {
                console.log(`Location mismatch: Target ${targetUser.location?.id} vs Admin ${req.user.locationId}`);
                throw new UnauthorizedException('You can only assign badges to users in your location');
            }
        }

        return this.usersService.assignBadge(+id, badgeId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/badges/:badgeId')
    async removeBadge(@Param('id') id: string, @Param('badgeId') badgeId: string, @Request() req) {
        if (!req.user.isAdmin && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new UnauthorizedException('Only admins can remove badges');
        }

        // If Admin (not Super Admin), verify user is in same location
        if (req.user.role === 'admin') {
            const targetUser = await this.usersService.findOne(+id);
            if (!targetUser) {
                throw new UnauthorizedException('User not found');
            }
            if (targetUser.location?.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only remove badges from users in your location');
            }
        }

        return this.usersService.removeBadge(+id, +badgeId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('profile/image')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/profile-images',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    uploadProfileImage(@Request() req, @UploadedFile() file: any) {
        return this.usersService.updateProfileImage(req.user.userId, `/uploads/profile-images/${file.filename}`);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/image')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/profile-images',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    async uploadUserImage(@Param('id') id: string, @Request() req, @UploadedFile() file: any) {
        if (!req.user.isAdmin && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new UnauthorizedException('Only admins can upload user images');
        }

        // If Admin (not Super Admin), verify user is in same location
        if (req.user.role === 'admin') {
            const targetUser = await this.usersService.findOne(+id);
            if (!targetUser) {
                throw new UnauthorizedException('User not found');
            }
            if (targetUser.location?.id !== req.user.locationId) {
                throw new UnauthorizedException('You can only upload images for users in your location');
            }
        }

        return this.usersService.updateProfileImage(+id, `/uploads/profile-images/${file.filename}`);
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
}
