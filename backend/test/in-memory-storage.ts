import { Readable } from 'stream';

/** Stand-in for StorageService in e2e tests: keeps objects in a Map. */
export class InMemoryStorage {
    objects = new Map<string, { body: Buffer; contentType: string }>();

    async put(key: string, body: Buffer, contentType: string) {
        this.objects.set(key, { body, contentType });
    }

    async get(key: string) {
        const object = this.objects.get(key);
        if (!object) return null;
        return { body: Readable.from(object.body), contentType: object.contentType, contentLength: object.body.length };
    }

    async exists(key: string) {
        return this.objects.has(key);
    }

    async delete(key: string) {
        this.objects.delete(key);
    }
}
