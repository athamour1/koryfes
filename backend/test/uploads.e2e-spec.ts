import { Readable } from 'stream';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './helpers';
import { InMemoryStorage } from './in-memory-storage';

describe('GET /uploads/* (e2e)', () => {
    let app: NestExpressApplication;
    const storage = new InMemoryStorage();
    const http = () => request(app.getHttpServer());

    beforeAll(async () => {
        app = await createTestApp(storage);
        await storage.put('unit-flags/abc.webp', Buffer.from('webp-bytes'), 'image/webp');
    });

    afterAll(async () => {
        await app?.close();
    });

    it('serves a stored object with its content type and long cache', async () => {
        const res = await http().get('/uploads/unit-flags/abc.webp').expect(200);
        expect(res.headers['content-type']).toBe('image/webp');
        expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
        expect(res.body.toString()).toBe('webp-bytes');
    });

    it('returns 404 for a missing object', () => {
        return http().get('/uploads/unit-flags/missing.webp').expect(404);
    });

    it('never resolves paths outside the keys', async () => {
        await http().get('/uploads/..%2f..%2fetc%2fpasswd').expect(404);
        await http().get('/uploads/unit-flags/%2e%2e/abc.webp').expect(404);
    });

    it('answers 404, not 500, for a malformed escape in the key', () => {
        return http().get('/uploads/unit-flags/%25zz.webp').expect(404);
    });

    it('is not rate limited', async () => {
        for (let i = 0; i < 120; i++) {
            await http().get('/uploads/unit-flags/abc.webp').expect(200);
        }
    });
});

describe('legacy uploads migration (e2e)', () => {
    it('copies files from UPLOADS_DIR into the bucket once', async () => {
        const dir = mkdtempSync(join(tmpdir(), 'uploads-'));
        mkdirSync(join(dir, 'unit-flags'));
        writeFileSync(join(dir, 'unit-flags', 'old.png'), Buffer.from('png-bytes'));
        writeFileSync(join(dir, 'unit-flags', 'notes.txt'), 'ignored');
        process.env.UPLOADS_DIR = dir;
        const storage = new InMemoryStorage();
        const app = await createTestApp(storage);
        try {
            expect(storage.objects.get('unit-flags/old.png')).toEqual({ body: Buffer.from('png-bytes'), contentType: 'image/png' });
            expect(storage.objects.has('unit-flags/notes.txt')).toBe(false);
        } finally {
            delete process.env.UPLOADS_DIR;
            await app.close();
        }
    });
});
describe('GET /uploads/* when the bucket stream fails (e2e)', () => {
    it('drops that response and keeps serving', async () => {
        const storage = new InMemoryStorage();
        await storage.put('unit-flags/ok.webp', Buffer.from('ok'), 'image/webp');
        const realGet = storage.get.bind(storage);
        storage.get = async (key: string) => {
            if (key !== 'unit-flags/broken.webp') return realGet(key);
            // the connection to Garage resets after the first chunk
            const body = new Readable({ read() {} });
            body.push(Buffer.from('partial'));
            setTimeout(() => body.destroy(new Error('ECONNRESET')), 20);
            return { body, contentType: 'image/webp' };
        };
        const app = await createTestApp(storage);
        try {
            await expect(request(app.getHttpServer()).get('/uploads/unit-flags/broken.webp')).rejects.toThrow();
            await request(app.getHttpServer()).get('/uploads/unit-flags/ok.webp').expect(200);
        } finally {
            await app.close();
        }
    });
});

describe('legacy uploads migration, later boots (e2e)', () => {
    const legacyDir = () => {
        const dir = mkdtempSync(join(tmpdir(), 'uploads-'));
        mkdirSync(join(dir, 'unit-flags'));
        writeFileSync(join(dir, 'unit-flags', 'old.png'), Buffer.from('png-bytes'));
        return dir;
    };

    it('does not bring back an object deleted after the first copy', async () => {
        process.env.UPLOADS_DIR = legacyDir();
        const storage = new InMemoryStorage();
        try {
            await (await createTestApp(storage)).close();
            await storage.delete('unit-flags/old.png'); // e.g. the flag was replaced
            await (await createTestApp(storage)).close();
            expect(storage.objects.has('unit-flags/old.png')).toBe(false);
        } finally {
            delete process.env.UPLOADS_DIR;
        }
    });

    it('still boots when the bucket is unreachable', async () => {
        process.env.UPLOADS_DIR = legacyDir();
        const storage = new InMemoryStorage();
        storage.exists = async () => { throw new Error('bucket unreachable'); };
        try {
            const app = await createTestApp(storage);
            await request(app.getHttpServer()).get('/health').expect(200);
            await app.close();
        } finally {
            delete process.env.UPLOADS_DIR;
        }
    });
});
