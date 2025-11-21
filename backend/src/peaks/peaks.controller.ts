import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PeaksService } from './peaks.service';
import { Peak } from './peak.entity';
import { UserRole } from '../users/entities/user.entity';

@Controller('peaks')
@UseGuards(JwtAuthGuard)
export class PeaksController {
    constructor(private readonly peaksService: PeaksService) { }

    @Get()
    async findAll(): Promise<Peak[]> {
        return this.peaksService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Peak> {
        return this.peaksService.findOne(+id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/progress-images',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    async create(@Body() peakData: Partial<Peak>, @UploadedFile() file: any): Promise<Peak> {
        console.log('Received peakData:', peakData);
        console.log('Received file:', file);
        const imagePath = file ? `/uploads/progress-images/${file.filename}` : undefined;
        return this.peaksService.create({ ...peakData, image: imagePath });
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/progress-images',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    async update(
        @Param('id') id: string,
        @Body() peakData: Partial<Peak>,
        @UploadedFile() file: any,
    ): Promise<Peak> {
        if (file) {
            peakData.image = `/uploads/progress-images/${file.filename}`;
        }
        return this.peaksService.update(+id, peakData);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string): Promise<void> {
        return this.peaksService.remove(+id);
    }
}
