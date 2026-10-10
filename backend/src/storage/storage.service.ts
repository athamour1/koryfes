import { Injectable } from '@nestjs/common';
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export interface StoredObject {
    body: Readable;
    contentType?: string;
    contentLength?: number;
}

const isNotFound = (e: any) => e?.name === 'NoSuchKey' || e?.name === 'NotFound' || e?.$metadata?.httpStatusCode === 404;

/** Uploaded files, kept in the S3 bucket (Garage). */
@Injectable()
export class StorageService {
    private readonly bucket = process.env.S3_BUCKET || 'koryfes';
    private readonly client = new S3Client({
        endpoint: process.env.S3_ENDPOINT || 'http://garage:3900',
        region: process.env.S3_REGION || 'garage',
        forcePathStyle: true,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
    });

    async put(key: string, body: Buffer, contentType: string): Promise<void> {
        await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }));
    }

    async get(key: string): Promise<StoredObject | null> {
        try {
            const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
            return { body: res.Body as Readable, contentType: res.ContentType, contentLength: res.ContentLength };
        } catch (e) {
            if (isNotFound(e)) return null;
            throw e;
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
            return true;
        } catch (e) {
            if (isNotFound(e)) return false;
            throw e;
        }
    }

    async delete(key: string): Promise<void> {
        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }
}
