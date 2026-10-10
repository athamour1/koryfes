import { Logger } from '@nestjs/common';
import { StorageService } from './storage.service';

const logger = new Logger('Storage');

/**
 * Deletes objects after their DB rows are gone. A failure only leaves an
 * orphaned object in the bucket, so it is logged rather than failing a
 * request whose real work (the DB change) has already happened.
 */
export async function deleteQuietly(storage: Pick<StorageService, 'delete'>, keys: (string | null | undefined)[]): Promise<void> {
    for (const key of keys) {
        if (!key) continue;
        try {
            await storage.delete(key);
        } catch (e) {
            logger.warn(`Could not delete ${key} from the bucket: ${e.message}`);
        }
    }
}
