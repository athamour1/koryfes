export class jwtConstants {
    static secret = process.env.JWT_SECRET || 'secretKey-dev-only-change-in-production';
}
