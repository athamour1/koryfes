import { randomBytes } from 'crypto';

const PREFIX = '/uploads/';

/** DB path for an object key, e.g. "unit-flags/x.webp" -> "/uploads/unit-flags/x.webp". */
export function toUploadPath(key: string): string {
    return PREFIX + key;
}

/** Object key for a DB path, or null if it is not one of ours. */
export function keyFromUploadPath(path: string | null | undefined): string | null {
    return path && path.startsWith(PREFIX) ? path.slice(PREFIX.length) : null;
}

/** New random key for a processed (WebP) image under the given prefix. */
export function newImageKey(prefix: string): string {
    return `${prefix}/${randomBytes(16).toString('hex')}.webp`;
}

/** Keys are our own "a/b/c.ext" names: no empty, dot or dot-dot segments. */
export function isSafeKey(key: string): boolean {
    return key.length > 0 && key.split('/').every((s) => s !== '' && s !== '.' && s !== '..');
}
