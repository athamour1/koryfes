import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserProgressService } from './user-progress.service';
import { AwardPathDto, AwardDiplomaDto, AwardPeakDto } from './dto/user-progress.dto';
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
    async awardPeak(@Body() body: AwardPeakDto, @Request() req): Promise<any> {
        await this.assertSameLocation(req.user, body.userId);
        return this.userProgressService.awardPeak(body.userId, body.peakId);
    }

    /**
     * Award a path to a user (admin/leader only)
     */
    @Post('award-path')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async awardPath(@Body() awardPathDto: AwardPathDto, @Request() req): Promise<any> {
        await this.assertSameLocation(req.user, awardPathDto.userId);
        return this.userProgressService.awardPath(awardPathDto.userId, awardPathDto.pathId);
    }

    /**
     * Award a diploma to a user (admin/leader only)
     */
    @Post('award-diploma')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async awardDiploma(@Body() awardDiplomaDto: AwardDiplomaDto, @Request() req): Promise<any> {
        await this.assertSameLocation(req.user, awardDiplomaDto.userId);
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

    /**
     * Location admins may only award progress to users in their own location
     */
    private async assertSameLocation(user: { role: string; locationId?: number }, targetUserId: number) {
        if (user.role !== UserRole.ADMIN) {
            return;
        }
        const targetLocationId = await this.userProgressService.getUserLocationId(targetUserId);
        if (!user.locationId || targetLocationId !== user.locationId) {
            throw new ForbiddenException('You can only award progress to users in your location');
        }
    }
}
