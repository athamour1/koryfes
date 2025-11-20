import { Controller, Get, Post, Body, Param, UseGuards, Request, UnauthorizedException, UseInterceptors, UploadedFile, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadgesService } from './badges.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('badges')
export class BadgesController {
    constructor(private readonly badgesService: BadgesService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/badge-images',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    create(@Body() createBadgeDto: any, @UploadedFile() file: any, @Request() req) {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new UnauthorizedException('Only admins can create badges');
        }
        const imagePath = file ? `/uploads/badge-images/${file.filename}` : '';
        return this.badgesService.create({ ...createBadgeDto, image: imagePath });
    }

    @Get()
    findAll() {
        return this.badgesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.badgesService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/badge-images',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    update(@Param('id') id: string, @Body() updateData: any, @UploadedFile() file: any, @Request() req) {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new UnauthorizedException('Only admins can update badges');
        }
        if (file) {
            updateData.image = `/uploads/badge-images/${file.filename}`;
        }
        return this.badgesService.update(+id, updateData);
    }
}
