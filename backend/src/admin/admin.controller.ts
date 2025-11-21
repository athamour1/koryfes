import { Controller, Get, Post, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly usersService: UsersService,
        private readonly badgesService: BadgesService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('stats')
    async getStats(@Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Only admins can access stats');
        }

        const users = await this.usersService.getAllIncludingAdmins();
        const badges = await this.badgesService.findAll();

        // Filter out admin users for stats
        const regularUsers = users.filter(u => !u.isAdmin);

        // Calculate total badges awarded
        const totalBadgesAwarded = regularUsers.reduce((sum, user: any) => sum + (user.badges?.length || 0), 0);

        // Calculate average badges per user
        const avgBadgesPerUser = regularUsers.length > 0
            ? (totalBadgesAwarded / regularUsers.length).toFixed(1)
            : 0;

        // Get top users by badge count
        const topUsers = regularUsers
            .map((user: any) => ({
                id: user.id,
                username: user.username,
                location: user.location,
                profileImage: user.profileImage,
                badgeCount: user.badges?.length || 0,
            }))
            .sort((a, b) => b.badgeCount - a.badgeCount)
            .slice(0, 5);

        // Get badge distribution (how many times each badge was awarded)
        const badgeDistribution = badges.map(badge => {
            const awardedCount = regularUsers.filter((user: any) =>
                user.badges?.some(b => b.id === badge.id)
            ).length;

            return {
                id: badge.id,
                name: badge.name,
                description: badge.description,
                image: badge.image,
                awardedCount,
            };
        }).sort((a, b) => b.awardedCount - a.awardedCount);

        return {
            totalUsers: regularUsers.length,
            totalBadges: badges.length,
            totalBadgesAwarded,
            avgBadgesPerUser,
            topUsers,
            badgeDistribution,
        };
    }
}
