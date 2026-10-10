import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PathsService } from './paths.service';
import { Path } from './path.entity';
import { PathCategory } from './path-category.enum';
import { UserRole } from '../users/entities/user.entity';

@Controller('paths')
@UseGuards(JwtAuthGuard)
export class PathsController {
    constructor(private readonly pathsService: PathsService) { }

    @Get()
    async findAll(@Query('category') category?: PathCategory): Promise<Path[]> {
        return this.pathsService.findAll(category);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Path> {
        return this.pathsService.findOne(+id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async create(@Body() pathData: Partial<Path>): Promise<Path> {
        return this.pathsService.create(pathData);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async update(
        @Param('id') id: string,
        @Body() pathData: Partial<Path>,
    ): Promise<Path> {
        return this.pathsService.update(+id, pathData);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string): Promise<void> {
        return this.pathsService.remove(+id);
    }
}
