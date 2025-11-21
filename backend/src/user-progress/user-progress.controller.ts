import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserProgressService } from './user-progress.service';
import { AwardPathDto, AwardDiplomaDto, UserProgressResponseDto } from './dto/user-progress.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('user-progress')
@UseGuards(JwtAuthGuard)
export class UserProgressController {
    constructor(private readonly userProgressService: UserProgressService) { }

    /**
     * Get current user's progress
     */
    @Get('me')
    async getMyProgress(@Request() req): Promise<any> {
        return this.userProgressService.getUserProgress(req.user.userId);
    }

    /**
     * Initialize progress for current user
     */
    @Post('initialize')
    async initializeMyProgress(@Request() req): Promise<any> {
        return this.userProgressService.initializeProgress(req.user.userId);
    }

    /**
     * Award a peak to a user (admin only - for Promise peak)
     */
    @Post('award-peak')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async awardPeak(@Body() body: { userId: number; peakId: number }): Promise<any> {
        return this.userProgressService.awardPeak(body.userId, body.peakId);
    }

    /**
     * Award a path to a user (admin/leader only)
     */
    @Post('award-path')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async awardPath(@Body() awardPathDto: AwardPathDto): Promise<any> {
        return this.userProgressService.awardPath(awardPathDto.userId, awardPathDto.pathId);
    }

    /**
     * Award a diploma to a user (admin/leader only)
     */
    @Post('award-diploma')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async awardDiploma(@Body() awardDiplomaDto: AwardDiplomaDto): Promise<any> {
        return this.userProgressService.awardDiploma(
            awardDiplomaDto.userId,
            awardDiplomaDto.diplomaId,
            awardDiplomaDto.type,
        );
    }

    /**
     * Get all user progress (admin only)
     */
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async findAll(): Promise<any[]> {
        return this.userProgressService.findAll();
    }
}
