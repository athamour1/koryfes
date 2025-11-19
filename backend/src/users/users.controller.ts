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

    @Get()
    findAll(@Query('location') location: string, @Query('name') name: string) {
        return this.usersService.findAll(location, name);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    updateUser(@Param('id') id: string, @Body() updateData: any, @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Only admins can update users');
        }
        return this.usersService.update(+id, updateData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/badges')
    async assignBadge(@Param('id') id: string, @Body('badgeId') badgeId: number, @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Only admins can assign badges');
        }
        return this.usersService.assignBadge(+id, badgeId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/badges/:badgeId')
    async removeBadge(@Param('id') id: string, @Param('badgeId') badgeId: string, @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Only admins can remove badges');
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
    uploadUserImage(@Param('id') id: string, @Request() req, @UploadedFile() file: any) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Only admins can upload user images');
        }
        return this.usersService.updateProfileImage(+id, `/uploads/profile-images/${file.filename}`);
    }
}
