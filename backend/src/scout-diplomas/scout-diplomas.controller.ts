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
import { ScoutDiplomasService } from './scout-diplomas.service';
import { ScoutDiploma } from './scout-diploma.entity';
import { UserRole } from '../users/entities/user.entity';

@Controller('scout-diplomas')
@UseGuards(JwtAuthGuard)
export class ScoutDiplomasController {
    constructor(private readonly scoutDiplomasService: ScoutDiplomasService) { }

    @Get()
    async findAll(): Promise<ScoutDiploma[]> {
        return this.scoutDiplomasService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ScoutDiploma> {
        return this.scoutDiplomasService.findOne(+id);
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
    async create(@Body() diplomaData: Partial<ScoutDiploma>, @UploadedFile() file: any): Promise<ScoutDiploma> {
        const imagePath = file ? `/uploads/progress-images/${file.filename}` : undefined;
        return this.scoutDiplomasService.create({ ...diplomaData, image: imagePath });
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
        @Body() diplomaData: Partial<ScoutDiploma>,
        @UploadedFile() file: any,
    ): Promise<ScoutDiploma> {
        if (file) {
            diplomaData.image = `/uploads/progress-images/${file.filename}`;
        }
        return this.scoutDiplomasService.update(+id, diplomaData);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string): Promise<void> {
        return this.scoutDiplomasService.remove(+id);
    }
}
