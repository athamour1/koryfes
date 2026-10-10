import { resolveJwtSecret } from './constants';

describe('resolveJwtSecret', () => {
    const strong = 'k3J9xQ2mV8pL5wR1tY7uI4oP6aS0dF3gH8jK2lZ9';

    it('falls back to a dev secret outside production', () => {
        expect(resolveJwtSecret({ NODE_ENV: 'development' })).toBeTruthy();
    });

    it('accepts a strong secret in production', () => {
        expect(resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: strong })).toBe(strong);
    });

    it.each([
        ['missing', undefined],
        ['short', 'short-secret'],
        ['placeholder', 'CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_PLEASE_OK'],
        ['unexpanded command', '$(openssl rand -base64 48)-padding-padding'],
    ])('rejects a %s secret in production', (_label, secret) => {
        expect(() => resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: secret })).toThrow(/JWT_SECRET/);
    });
});
