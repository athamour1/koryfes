import { Controller, Request, Post, UseGuards, Body, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @Post('login')
    async login(@Body() req) {
        const user = await this.authService.validateUser(req.username, req.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user, req.rememberMe);
    }

    @Post('register')
    async register(@Body() req) {
        return this.authService.register(req);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        return this.usersService.findOne(req.user.userId);
    }

    @Post('refresh')
    async refresh(@Body('refresh_token') refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token required');
        }
        return this.authService.refreshAccessToken(refreshToken);
    }

    @Post('logout')
    async logout(@Body('refresh_token') refreshToken: string) {
        if (refreshToken) {
            await this.authService.revokeRefreshToken(refreshToken);
        }
        return { message: 'Logged out successfully' };
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: any) {
        return this.authService.resetPassword(body.token, body.password);
    }
}
