import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { promises as fs } from 'fs';
import { extname, join, relative, sep } from 'path';
import { StorageService } from './storage.service';

/** Bucket object that records the one-time copy has been done. */
const DONE_MARKER = '.migrations/legacy-uploads-done';

const TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

/**
 * Copies files from the old local uploads/ folder into the bucket under the
 * same key (so existing /uploads/... paths in the DB keep working), once:
 * a marker object records that it is done. The folder is left untouched.
 */
@Injectable()
export class LegacyUploadsMigrator implements OnApplicationBootstrap {
    private readonly logger = new Logger(LegacyUploadsMigrator.name);
    private readonly root = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');

    constructor(private readonly storage: StorageService) { }

    async onApplicationBootstrap() {
        try {
            await this.migrate();
        } catch (e) {
            // the app still works for everything else; the next start retries
            this.logger.error(`Could not copy legacy uploads to the bucket: ${e.message}`);
        }
    }

    private async migrate() {
        // once done, never again: a later copy would bring back objects that
        // were deleted on purpose (a replaced flag, a deleted unit)
        if (await this.storage.exists(DONE_MARKER)) return;
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
        await this.storage.put(DONE_MARKER, Buffer.from(new Date().toISOString()), 'text/plain');
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
