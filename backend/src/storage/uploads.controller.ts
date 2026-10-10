import { Controller, Get, NotFoundException, Req, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { pipeline } from 'stream';
import { StorageService } from './storage.service';
import { isSafeKey } from './upload-paths';

/** Serves uploaded files from the bucket at their old /uploads/<key> URLs. */
@SkipThrottle()
@Controller('uploads')
export class UploadsController {
    constructor(private readonly storage: StorageService) { }

    @Get('*key')
    async serve(@Req() req: Request, @Res() res: Response) {
        const raw = req.params.key as unknown as string | string[];
        // Express has already decoded the segments; decoding again would turn a
        // literal % in a key into a URIError
        const key = Array.isArray(raw) ? raw.join('/') : raw;
        if (!isSafeKey(key)) {
            throw new NotFoundException();
        }
        const object = await this.storage.get(key);
        if (!object) {
            throw new NotFoundException();
        }
        res.setHeader('Content-Type', object.contentType || 'application/octet-stream');
        if (object.contentLength !== undefined) {
            res.setHeader('Content-Length', String(object.contentLength));
        }
        // keys are random and never rewritten
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        // pipeline, not pipe: a reset from the bucket must not crash the process,
        // and a client that goes away must release the bucket connection
        pipeline(object.body, res, (err) => {
            if (err) res.destroy(err);
        });
    }
}
