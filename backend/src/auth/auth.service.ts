import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
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

        const expiresIn = rememberMe ? '7d' : '60m';
        const accessToken = this.jwtService.sign(payload, { expiresIn });

        // Calculate absolute expiration time for frontend usage
        const expirationDate = new Date();
        if (rememberMe) {
            expirationDate.setDate(expirationDate.getDate() + 7);
        } else {
            expirationDate.setMinutes(expirationDate.getMinutes() + 60);
        }

        return {
            access_token: accessToken,
            expires_at: expirationDate.toISOString(),
            user: {
                id: user.id,
                username: user.username,
                location: user.location,
                role: user.role,
                isAdmin: user.isAdmin, // Keep for legacy frontend compat if needed
                unitId: user.unit?.id,
                unitRole: user.unitRole
            }
        };
    }

    async register(createUserDto: any) {
        const isProd = process.env.NODE_ENV === 'production';

        // Production password validation
        if (isProd) {
            const password = createUserDto.password;
            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }
            if (!/[A-Z]/.test(password)) {
                throw new Error('Password must contain at least one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                throw new Error('Password must contain at least one lowercase letter');
            }
            if (!/[0-9]/.test(password)) {
                throw new Error('Password must contain at least one number');
            }
        }

        const existingUser = await this.usersService.findByUsername(createUserDto.username);
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const user = await this.usersService.create({
            ...createUserDto,
        });
        return { message: 'User created successfully', userId: user.id };
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

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour expiration

        await this.usersService.update(user.id, {
            resetPasswordToken: token,
            resetPasswordExpires: expires
        });

        // Mock email sending
        console.log(`[MOCK EMAIL] Password reset token for ${user.username}: ${token}`);
        // In a real app, we would send an email here.

        return { message: 'If a user with this username exists, a password reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.usersService.findByResetToken(token);
        if (!user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
            throw new UnauthorizedException('Token expired');
        }

        await this.usersService.update(user.id, {
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        return { message: 'Password reset successfully' };
    }
}

