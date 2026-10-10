import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    ParseIntPipe,
    ParseEnumPipe,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnitRole, UserRole } from '../users/entities/user.entity';
import { UserProgressService } from './user-progress.service';
import { AwardDiplomaDto, AwardPathDto } from './dto/user-progress.dto';

enum DiplomaTypeParam {
    GUIDE = 'guide',
    ELECTIVE = 'elective',
}

/**
 * Individual progress of one Guide. Viewing: the Guide, their unit leaders,
 * their location's admin and super admins. Awarding / removing: the location
 * admin (the branch leader who knows the group) and super admins.
 */
@Controller('users/:userId/progress')
@UseGuards(JwtAuthGuard)
export class ProgressAwardsController {
    constructor(private readonly progress: UserProgressService) { }

    @Get()
    async get(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
        const me = req.user;
        if (me.userId !== userId && me.role !== UserRole.SUPER_ADMIN) {
            const target = await this.progress.getUserScope(userId);
            const isLocationAdmin = me.role === UserRole.ADMIN && !!me.locationId && target.locationId === me.locationId;
            const isUnitLeader = [UnitRole.LEADER, UnitRole.DEPUTY_LEADER].includes(me.unitRole)
                && !!me.unitId && target.unitId === me.unitId;
            if (!isLocationAdmin && !isUnitLeader) {
                throw new ForbiddenException("You can't view this user's progress");
            }
        }
        return this.progress.getProgressWithEvaluation(userId);
    }

    @Post('promise')
    async givePromise(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
        await this.assertCanAward(req.user, userId);
        return this.progress.setPromise(userId, true);
    }

    @Delete('promise')
    async removePromise(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
        await this.assertCanAward(req.user, userId);
        return this.progress.setPromise(userId, false);
    }

    @Post('paths')
    async awardPath(@Param('userId', ParseIntPipe) userId: number, @Body() body: AwardPathDto, @Request() req) {
        await this.assertCanAward(req.user, userId);
        return this.progress.awardPath(userId, body.pathId);
    }

    @Delete('paths/:pathId')
    async removePath(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('pathId', ParseIntPipe) pathId: number,
        @Request() req,
    ) {
        await this.assertCanAward(req.user, userId);
        return this.progress.removePath(userId, pathId);
    }

    @Post('diplomas')
    async awardDiploma(@Param('userId', ParseIntPipe) userId: number, @Body() body: AwardDiplomaDto, @Request() req) {
        await this.assertCanAward(req.user, userId);
        return this.progress.awardDiploma(userId, body.diplomaId, body.type ?? 'elective');
    }

    @Delete('diplomas/:type/:diplomaId')
    async removeDiploma(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('type', new ParseEnumPipe(DiplomaTypeParam)) type: DiplomaTypeParam,
        @Param('diplomaId', ParseIntPipe) diplomaId: number,
        @Request() req,
    ) {
        await this.assertCanAward(req.user, userId);
        return this.progress.removeDiploma(userId, diplomaId, type);
    }

    private async assertCanAward(me: { role: string; locationId?: number }, userId: number) {
        if (me.role === UserRole.SUPER_ADMIN) {
            return;
        }
        if (me.role === UserRole.ADMIN && me.locationId) {
            const target = await this.progress.getUserScope(userId);
            if (target.locationId === me.locationId) {
                return;
            }
        }
        throw new ForbiddenException('Only the leader of this location can change its progress');
    }
}
