import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { assertPasswordPolicy } from '../common/password-policy';

function hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    private generateRefreshToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }

    async login(user: any, rememberMe: boolean = false) {
        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role,
            locationId: user.location?.id,
            unitId: user.unit?.id,
            unitRole: user.unitRole
        };

        // Access token: short-lived (15 minutes)
        const accessToken = this.jwtService.sign(payload);

        // Calculate access token expiration
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 15);

        const response: any = {
            access_token: accessToken,
            expires_at: expirationDate.toISOString(),
            user: {
                id: user.id,
                username: user.username,
                location: user.location,
                role: user.role,
                isAdmin: user.isAdmin,
                unitId: user.unit?.id,
                unitRole: user.unitRole
            }
        };

        // Only generate refresh token if user wants to stay logged in
        if (rememberMe) {
            const refreshToken = this.generateRefreshToken();
            const refreshExpiresAt = new Date();
            refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // 30 days

            // Store refresh token in database
            await this.refreshTokenRepository.save({
                token: refreshToken,
                user: { id: user.id },
                expiresAt: refreshExpiresAt,
            });

            response.refresh_token = refreshToken;
            response.refresh_expires_at = refreshExpiresAt.toISOString();
        }

        return response;
    }

    async refreshAccessToken(refreshToken: string) {
        // Find refresh token in database
        const storedToken = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken },
            relations: ['user', 'user.location', 'user.unit'],
        });

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Check if token has expired
        if (new Date() > storedToken.expiresAt) {
            // Delete expired token
            await this.refreshTokenRepository.remove(storedToken);
            throw new UnauthorizedException('Refresh token expired');
        }

        // Generate new access token
        const user = storedToken.user;
        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role,
            locationId: user.location?.id,
            unitId: user.unit?.id,
            unitRole: user.unitRole
        };

        const accessToken = this.jwtService.sign(payload);
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 15);

        // Token rotation: generate new refresh token
        const newRefreshToken = this.generateRefreshToken();
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30);

        // Delete old refresh token and create new one (rotation)
        await this.refreshTokenRepository.remove(storedToken);
        await this.refreshTokenRepository.save({
            token: newRefreshToken,
            user: { id: user.id },
            expiresAt: refreshExpiresAt,
        });

        return {
            access_token: accessToken,
            expires_at: expirationDate.toISOString(),
            refresh_token: newRefreshToken,
            refresh_expires_at: refreshExpiresAt.toISOString(),
        };
    }

    async revokeRefreshToken(refreshToken: string) {
        const storedToken = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken },
        });

        if (storedToken) {
            await this.refreshTokenRepository.remove(storedToken);
        }
    }

    async cleanupExpiredTokens() {
        // Delete all expired refresh tokens
        await this.refreshTokenRepository.delete({
            expiresAt: LessThan(new Date()),
        });
    }

    async forgotPassword(email: string) {
        // In this app, username is treated as email or we assume username is unique.
        // The prompt asks for "forgot password methods".
        // Let's assume username IS the email or we look up by username.
        // Given the User entity has 'username' and no 'email', we'll use username.
        const user = await this.usersService.findByUsername(email);
        if (!user) {
            // Return success even if user not found to prevent enumeration
            return { message: 'If a user with this username exists, a password reset link has been sent.' };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour expiration

        await this.usersService.update(user.id, {
            // Only the hash is stored, so a database leak doesn't leak live tokens
            resetPasswordToken: hashResetToken(token),
            resetPasswordExpires: expires
        });

        // No email delivery yet: expose the token in development logs only
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[MOCK EMAIL] Password reset token for ${user.username}: ${token}`);
        }

        return { message: 'If a user with this username exists, a password reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        if (!token) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const user = await this.usersService.findByResetToken(hashResetToken(token));
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        assertPasswordPolicy(newPassword);

        await this.usersService.update(user.id, {
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        return { message: 'Password reset successfully' };
    }
}

