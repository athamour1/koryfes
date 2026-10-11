import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProgressService } from './user-progress.service';

@Controller('user-progress')
@UseGuards(JwtAuthGuard)
export class UserProgressController {
    constructor(private readonly userProgressService: UserProgressService) { }

    /**
     * Current user's progress, with the checklist towards each peak
     */
    @Get('me')
    getMyProgress(@Request() req) {
        return this.userProgressService.getProgressWithEvaluation(req.user.userId);
    }

    /**
     * The current user has seen the celebration for their latest milestones
     */
    @Post('me/celebrated')
    markCelebrated(@Request() req) {
        return this.userProgressService.markCelebrated(req.user.userId);
    }
}
