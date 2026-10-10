/**
 * One-shot setup of the Garage node over its admin API (v2): layout, bucket,
 * and the backend's S3 key with read/write on it. Safe to run on every start.
 * Runs as `node dist/src/storage/garage-init.js` from the backend image.
 */
const ADMIN_URL = process.env.GARAGE_ADMIN_URL || 'http://garage:3903';
const BUCKET = process.env.S3_BUCKET || 'koryfes';

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} must be set`);
    }
    return value;
}

const TOKEN = required('GARAGE_ADMIN_TOKEN');
const KEY_ID = required('S3_ACCESS_KEY_ID');
const KEY_SECRET = required('S3_SECRET_ACCESS_KEY');

async function call(method: string, path: string, body?: unknown): Promise<{ status: number; data: any }> {
    const res = await fetch(`${ADMIN_URL}${path}`, {
        method,
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok && res.status !== 404) {
        throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
    }
    return { status: res.status, data };
}

async function waitForGarage() {
    for (let attempt = 1; attempt <= 60; attempt++) {
        try {
            return (await call('GET', '/v2/GetClusterStatus')).data;
        } catch (e) {
            if (attempt === 60) throw e;
            await new Promise((r) => setTimeout(r, 1000));
        }
    }
}

async function main() {
    const status = await waitForGarage();
    const node = status.nodes[0];
    if (!node.role) {
        await call('POST', '/v2/UpdateClusterLayout', {
            roles: [{ id: node.id, zone: 'dc1', capacity: 100_000_000_000, tags: [] }],
        });
        const layout = (await call('GET', '/v2/GetClusterLayout')).data;
        await call('POST', '/v2/ApplyClusterLayout', { version: layout.version + 1 });
        console.log(`garage-init: layout applied for node ${node.id}`);
    }

    let bucket = await call('GET', `/v2/GetBucketInfo?globalAlias=${encodeURIComponent(BUCKET)}`);
    if (bucket.status === 404) {
        bucket = await call('POST', '/v2/CreateBucket', { globalAlias: BUCKET });
        console.log(`garage-init: bucket ${BUCKET} created`);
    }

    const key = await call('GET', `/v2/GetKeyInfo?id=${encodeURIComponent(KEY_ID)}`);
    if (key.status === 404) {
        await call('POST', '/v2/ImportKey', { accessKeyId: KEY_ID, secretAccessKey: KEY_SECRET, name: 'koryfes-backend' });
        console.log('garage-init: key imported');
    }

    await call('POST', '/v2/AllowBucketKey', {
        bucketId: bucket.data.id,
        accessKeyId: KEY_ID,
        permissions: { read: true, write: true, owner: false },
    });
    console.log('garage-init: ready');
}

main().catch((e) => {
    console.error(`garage-init failed: ${e.message}`);
    process.exit(1);
});
