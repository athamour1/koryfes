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
import { ElectiveDiplomasService } from './elective-diplomas.service';
import { ElectiveDiploma } from './elective-diploma.entity';
import { UserRole } from '../users/entities/user.entity';
import { imageUploadOptions } from '../common/image-upload';

@Controller('elective-diplomas')
@UseGuards(JwtAuthGuard)
export class ElectiveDiplomasController {
    constructor(private readonly electiveDiplomasService: ElectiveDiplomasService) { }

    @Get()
    async findAll(): Promise<ElectiveDiploma[]> {
        return this.electiveDiplomasService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ElectiveDiploma> {
        return this.electiveDiplomasService.findOne(+id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('image', imageUploadOptions('./uploads/progress-images')))
    async create(@Body() diplomaData: Partial<ElectiveDiploma>, @UploadedFile() file: any): Promise<ElectiveDiploma> {
        const imagePath = file ? `/uploads/progress-images/${file.filename}` : undefined;
        return this.electiveDiplomasService.create({ ...diplomaData, image: imagePath });
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('image', imageUploadOptions('./uploads/progress-images')))
    async update(
        @Param('id') id: string,
        @Body() diplomaData: Partial<ElectiveDiploma>,
        @UploadedFile() file: any,
    ): Promise<ElectiveDiploma> {
        if (file) {
            diplomaData.image = `/uploads/progress-images/${file.filename}`;
        }
        return this.electiveDiplomasService.update(+id, diplomaData);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string): Promise<void> {
        return this.electiveDiplomasService.remove(+id);
    }
}
