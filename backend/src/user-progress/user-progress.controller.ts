import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
}
