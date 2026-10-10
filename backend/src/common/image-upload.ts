import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomBytes } from 'crypto';
import { diskStorage } from 'multer';

const IMAGE_EXTENSIONS: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

/**
 * Multer options for image uploads: images only, max 5 MB, random file name
 * whose extension comes from the validated MIME type (never the client's
 * file name, so nothing like .html or .svg can be served from /uploads).
 */
export function imageUploadOptions(destination: string): MulterOptions {
    return {
        storage: diskStorage({
            destination,
            filename: (req, file, cb) => {
                cb(null, `${randomBytes(16).toString('hex')}${IMAGE_EXTENSIONS[file.mimetype]}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024, files: 1 },
        fileFilter: (req, file, cb) => {
            if (!IMAGE_EXTENSIONS[file.mimetype]) {
                return cb(new BadRequestException('Only JPEG, PNG, WebP or GIF images are allowed'), false);
            }
            cb(null, true);
        },
    };
}
