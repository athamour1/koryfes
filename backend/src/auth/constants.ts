function resolveJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (secret) {
        return secret;
    }
    // Never sign production tokens with a well-known fallback secret
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
    }
    return 'secretKey-dev-only-change-in-production';
}

export class jwtConstants {
    static secret = resolveJwtSecret();
}
