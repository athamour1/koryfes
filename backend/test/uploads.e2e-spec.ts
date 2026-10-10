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