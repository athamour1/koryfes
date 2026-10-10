// Placeholders shipped in the example env files / docs
const PLACEHOLDER_SECRETS = /change[_-]?(this|me)|your[_-]?secret|secretkey|dev-secret/i;

/**
 * Resolve the JWT signing secret. Production refuses to boot without a strong
 * one: a missing, short, placeholder or unexpanded `$(openssl ...)` secret
 * would let anyone forge tokens.
 */
export function resolveJwtSecret(env: NodeJS.ProcessEnv = process.env): string {
    const secret = env.JWT_SECRET;
    if (env.NODE_ENV !== 'production') {
        return secret || 'secretKey-dev-only-change-in-production';
    }

    if (!secret) {
        throw new Error('JWT_SECRET must be set in production');
    }
    if (secret.length < 32 || PLACEHOLDER_SECRETS.test(secret) || secret.includes('$(')) {
        throw new Error(
            'JWT_SECRET is too weak: use at least 32 random characters, e.g. the output of `openssl rand -base64 48`',
        );
    }
    return secret;
}

export class jwtConstants {
    static secret = resolveJwtSecret();
}
