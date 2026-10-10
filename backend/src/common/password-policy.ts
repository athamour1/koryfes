import { BadRequestException } from '@nestjs/common';

/**
 * Enforce password strength in production. Development keeps accepting
 * short demo passwords (the seed data uses "test").
 */
export function assertPasswordPolicy(password: string): void {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    if (password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        throw new BadRequestException('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        throw new BadRequestException('Password must contain at least one number');
    }
}
