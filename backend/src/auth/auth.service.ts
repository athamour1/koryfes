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

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, isAdmin: user.isAdmin };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                location: user.location,
                isAdmin: user.isAdmin
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

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return { message: 'User created successfully', userId: user.id };
    }
}
