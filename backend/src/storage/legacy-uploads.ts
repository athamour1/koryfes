import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { promises as fs } from 'fs';
import { extname, join, relative, sep } from 'path';
import { StorageService } from './storage.service';

const TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

/**
 * Copies files from the old local uploads/ folder into the bucket under the
 * same key (so existing /uploads/... paths in the DB keep working). Files
 * already in the bucket are skipped; the folder itself is left untouched.
 */
@Injectable()
export class LegacyUploadsMigrator implements OnApplicationBootstrap {
    private readonly logger = new Logger(LegacyUploadsMigrator.name);
    private readonly root = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');

    constructor(private readonly storage: StorageService) { }

    async onApplicationBootstrap() {
        let copied = 0;
        for (const file of await this.list(this.root)) {
            const key = relative(this.root, file).split(sep).join('/');
            const type = TYPES[extname(file).toLowerCase()];
            if (!type || (await this.storage.exists(key))) continue;
            await this.storage.put(key, await fs.readFile(file), type);
            copied++;
        }
        if (copied) {
            this.logger.log(`Copied ${copied} legacy upload(s) to the bucket`);
        }
    }

    private async list(dir: string): Promise<string[]> {
        let entries;
        try {
            entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
            return [];
        }
        const files = await Promise.all(entries.map((e) => (e.isDirectory() ? this.list(join(dir, e.name)) : [join(dir, e.name)])));
        return files.flat();
    }
}
