import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';
import sharp from 'sharp';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/** Longest side, in px, that stored images are scaled down to. */
export const IMAGE_MAX_SIDE = { photo: 1600, flag: 800 };

/**
 * Multer options for image uploads: images only, max 5 MB, kept in memory so
 * processImage() can re-encode them before they reach storage.
 */
export function imageUploadOptions(): MulterOptions {
    return {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024, files: 1 },
        fileFilter: (req, file, cb) => {
            if (!IMAGE_TYPES.has(file.mimetype)) {
                return cb(new BadRequestException('Only JPEG, PNG, WebP or GIF images are allowed'), false);
            }
            cb(null, true);
        },
    };
}

/**
 * Re-encodes an upload as WebP: upright (EXIF orientation applied), at most
 * maxSide px on its longest side, without metadata (no EXIF/GPS). Anything
 * sharp can't decode is rejected as a bad request.
 */
export async function processImage(buffer: Buffer, maxSide: number): Promise<Buffer> {
    try {
        return await sharp(buffer)
            .rotate()
            .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
    } catch {
        throw new BadRequestException('The file is not a readable image');
    }
}
