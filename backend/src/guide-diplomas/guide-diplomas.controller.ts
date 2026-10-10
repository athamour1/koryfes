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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GuideDiplomasService } from './guide-diplomas.service';
import { GuideDiploma } from './guide-diploma.entity';
import { UserRole } from '../users/entities/user.entity';
import { imageUploadOptions } from '../common/image-upload';

@Controller('guide-diplomas')
@UseGuards(JwtAuthGuard)
export class GuideDiplomasController {
    constructor(private readonly guideDiplomasService: GuideDiplomasService) { }

    @Get()
    async findAll(): Promise<GuideDiploma[]> {
        return this.guideDiplomasService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<GuideDiploma> {
        return this.guideDiplomasService.findOne(+id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('image', imageUploadOptions('./uploads/progress-images')))
    async create(@Body() diplomaData: Partial<GuideDiploma>, @UploadedFile() file: any): Promise<GuideDiploma> {
        const imagePath = file ? `/uploads/progress-images/${file.filename}` : undefined;
        return this.guideDiplomasService.create({ ...diplomaData, image: imagePath });
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('image', imageUploadOptions('./uploads/progress-images')))
    async update(
        @Param('id') id: string,
        @Body() diplomaData: Partial<GuideDiploma>,
        @UploadedFile() file: any,
    ): Promise<GuideDiploma> {
        if (file) {
            diplomaData.image = `/uploads/progress-images/${file.filename}`;
        }
        return this.guideDiplomasService.update(+id, diplomaData);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string): Promise<void> {
        return this.guideDiplomasService.remove(+id);
    }
}
