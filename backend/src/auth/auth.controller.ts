import { Controller, Request, Post, UseGuards, Body, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordDto, LoginDto, LogoutDto, RefreshTokenDto, ResetPasswordDto } from './dto/auth.dto';

// Stricter limit for credential endpoints: per IP per minute (default 10).
// Raise AUTH_THROTTLE_LIMIT only for automated test environments.
const AUTH_THROTTLE = {
    default: { limit: parseInt(process.env.AUTH_THROTTLE_LIMIT) || 10, ttl: 60000 },
};

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @Throttle(AUTH_THROTTLE)
    @Post('login')
    async login(@Body() body: LoginDto) {
        const user = await this.authService.validateUser(body.username, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user, body.rememberMe);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        return this.usersService.findOne(req.user.userId);
    }

    @Post('refresh')
    async refresh(@Body() body: RefreshTokenDto) {
        return this.authService.refreshAccessToken(body.refresh_token);
    }

    @Post('logout')
    async logout(@Body() body: LogoutDto) {
        if (body.refresh_token) {
            await this.authService.revokeRefreshToken(body.refresh_token);
        }
        return { message: 'Logged out successfully' };
    }

    @Throttle(AUTH_THROTTLE)
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        return this.authService.forgotPassword(body.email);
    }

    @Throttle(AUTH_THROTTLE)
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        return this.authService.resetPassword(body.token, body.password);
    }
}
