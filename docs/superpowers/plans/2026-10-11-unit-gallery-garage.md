# Γκαλερί ενωμοτίας, συμπίεση εικόνων και Garage S3: πλάνο υλοποίησης

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Κάθε ενωμοτία αποκτά γκαλερί (1 γωνιά + έως 9 δράσεις) σε μία κοινή σελίδα με λειτουργία επεξεργασίας. Όλες οι εικόνες συμπιέζονται και αποθηκεύονται σε Garage S3, σε dev και prod.

**Architecture:**
- **Garage:** μπαίνει στο compose ως ιδιωτική υπηρεσία. Ένα one-shot `garage-init`, με το image του backend, στήνει layout, bucket και κλειδί μέσω του admin API.
- **Backend:** γράφει μέσω ενός `StorageService` (`@aws-sdk/client-s3`) και σερβίρει το ίδιο `/uploads/*` διαβάζοντας από το S3. Στην εκκίνηση μεταφέρει τα παλιά τοπικά αρχεία.
- **Συμπίεση:** γίνεται στον browser με canvas και στον server με `sharp`.
- **Γκαλερί:** νέα οντότητα `UnitPhoto`, που εμφανίζεται στο `UnitPage.vue`. Το `/my-unit` κάνει redirect εκεί.

**Tech Stack:** NestJS 12, TypeORM 0.3 (Postgres + SQLite στα tests), `@aws-sdk/client-s3`, `sharp`, Garage v2.4.1, Vue 3 + Quasar, Pinia.

**Spec:** `docs/superpowers/specs/2026-10-11-unit-gallery-garage-design.md`

## Global Constraints

- Garage image: `dxflrs/garage:v2.4.1`, ένας κόμβος, `replication_factor = 1`, `db_engine = "sqlite"`, region `garage`.
- Bucket προεπιλογή `koryfes`. Κλειδί: access key `GK` + 24 hex, secret 64 hex.
- Μέγιστο ανεβάσματος 5MB. Δεκτοί τύποι MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- Όρια διαστάσεων: φωτογραφίες ≤1600px στη μεγάλη πλευρά, σημαίες ≤800px. Έξοδος WebP ποιότητας 80 στον server, 0.8 στον browser.
- Φωτογραφίες ανά ενωμοτία: 1 `corner`, το πολύ 9 `activity`.
- Διαδρομές στη βάση: `/uploads/<key>`. Κλειδιά S3: `unit-flags/<hex>.webp`, `unit-photos/<unitId>/<hex>.webp`.
- Δικαίωμα επεξεργασίας: super admin, `admin` του ίδιου τοπικού, `user` με `unitRole = 'leader'` και `unitId` την ίδια ενωμοτία.
- Prod: τα `GARAGE_RPC_SECRET`, `GARAGE_ADMIN_TOKEN`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` είναι υποχρεωτικά με `:?`.
- Τα e2e τρέχουν σε Node ≥24.9 (`node:24-trixie`), με in-memory storage και χωρίς Garage.
- Όλα τα νέα κείμενα UI μπαίνουν και στο `el.json` και στο `en.json`.

## Review Focus

1. **Rate limit στις εικόνες:** ο global `ThrottlerGuard` (100/λεπτό ανά IP) θα μετρούσε κάθε εικόνα. Αναμενόμενο: το `GET /uploads/*` εξαιρείται (`@SkipThrottle()`). Test στο Task 2.
2. **Path traversal στο `/uploads`:** ένα αίτημα `GET /uploads/../x` ή με `%2e%2e` δεν πρέπει να διαβάζει τίποτα έξω από τα κλειδιά. Αναμενόμενο: 404. Test στο Task 2.
3. **Αρχείο που λέει ότι είναι εικόνα αλλά δεν είναι** (π.χ. text με `Content-Type: image/png`). Αναμενόμενο: 400, όχι 500. Test στο Task 3.
4. **Η γωνιά ανεβαίνει δεύτερη φορά:** αναμενόμενο να μείνει μία γραμμή και να σβηστεί το παλιό αντικείμενο. Test στο Task 4.
5. **Φωτογραφία άλλης ενωμοτίας:** το `DELETE /units/A/photos/<id της B>` πρέπει να δίνει 404 και να μη σβήνει τίποτα. Test στο Task 4.

---

## File Structure

Backend:
- `garage/garage.toml` (νέο): ρύθμιση Garage.
- `backend/src/storage/storage.service.ts` (νέο): το S3 client, με `put/get/exists/delete`.
- `backend/src/storage/storage.module.ts` (νέο): global module που εξάγει το `StorageService` και το `UploadsController`.
- `backend/src/storage/uploads.controller.ts` (νέο): `GET /uploads/*`.
- `backend/src/storage/legacy-uploads.ts` (νέο): μεταφορά του `./uploads` στο S3 κατά την εκκίνηση.
- `backend/src/storage/upload-paths.ts` (νέο): `toUploadPath`, `keyFromUploadPath`, `newImageKey`.
- `backend/src/storage/garage-init.ts` (νέο): standalone script για το admin API.
- `backend/src/common/image-upload.ts` (αλλαγή): `memoryStorage` και `processImage()` με το sharp.
- `backend/src/units/entities/unit-photo.entity.ts` (νέο).
- `backend/src/units/unit-access.ts` (νέο): `assertCanEditUnit`.
- `backend/src/units/unit-photos.service.ts` (νέο).
- `backend/src/units/units.controller.ts`, `units.service.ts`, `units.module.ts`, `entities/unit.entity.ts` (αλλαγή).
- `backend/src/migrations/1791700000000-UnitPhotos.ts` (νέο).
- `backend/src/app.module.ts`, `backend/src/main.ts` (αλλαγή): βγαίνει το static serving και μπαίνει το `StorageModule`.
- `backend/test/in-memory-storage.ts` (νέο), `backend/test/helpers.ts` (αλλαγή), `backend/test/uploads.e2e-spec.ts` (νέο), `backend/test/unit-photos.e2e-spec.ts` (νέο).

Ops:
- `docker-compose.yml`, `docker-compose.prod.yml`, `.env.example`, `.env.production.example`, `devops/DEPLOYMENT.md` (αλλαγή).

Frontend:
- `frontend/src/utils/compressImage.js` (νέο).
- `frontend/src/stores/unit.js` (αλλαγή): `uploadUnitPhoto`, `deleteUnitPhoto` και συμπίεση στο `uploadUnitFlag`.
- `frontend/src/components/unit/PhotoLightbox.vue` (νέο): προβολή σε πλήρη οθόνη.
- `frontend/src/components/unit/PhotoTile.vue` (νέο): πλακίδιο εικόνας ή «+», με ενέργειες επεξεργασίας.
- `frontend/src/pages/UnitPage.vue` (ξαναγράφεται): προβολή και επεξεργασία.
- `frontend/src/router/routes.js` (αλλαγή): το `my-unit` γίνεται redirect component.
- `frontend/src/pages/MyUnitPage.vue` (ξαναγράφεται): μόνο redirect ή κενή κατάσταση.
- `frontend/src/i18n/locales/el.json`, `en.json` (αλλαγή).

Τρόπος εκτέλεσης των e2e (χρησιμοποιείται σε όλα τα tasks):

```bash
cd /home/thanos98/Develope/koryfes/backend && docker run --rm -v "$PWD":/src:ro -w /app node:24-trixie sh -c \
  'cp -r /src/. /app/ && rm -rf node_modules && npm ci --silent >/dev/null 2>&1; (cd node_modules/sqlite3 && npx --yes prebuild-install -r napi >/dev/null 2>&1); npm run test:e2e -- <PATTERN> 2>&1 | grep -E "✓|✕|●|Tests:|Suites:"'
```

(Το `rm -rf node_modules` χρειάζεται επειδή τα τοπικά modules, αν υπάρχουν, είναι για άλλη πλατφόρμα. Το `<PATTERN>` είναι όνομα αρχείου test ή κενό για όλα.)

---

### Task 1: Garage στο stack (dev και prod)

**Files:**
- Create: `garage/garage.toml`, `backend/src/storage/garage-init.ts`
- Modify: `docker-compose.yml`, `docker-compose.prod.yml`, `.env.example`, `.env.production.example`, `devops/DEPLOYMENT.md`

**Interfaces:**
- Produces: η υπηρεσία `garage` είναι προσβάσιμη στο `http://garage:3900` (S3) και στο `http://garage:3903` (admin). Το bucket `${S3_BUCKET}` υπάρχει και το κλειδί `${S3_ACCESS_KEY_ID}` έχει read/write. Το `garage-init` τελειώνει με exit 0.
- Env που διαβάζει το backend από εδώ και πέρα: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.

- [ ] **Step 1: `garage/garage.toml`**

```toml
# Garage, ένας κόμβος για τα ανεβασμένα αρχεία. Τα rpc_secret και admin_token
# έρχονται από τα env GARAGE_RPC_SECRET και GARAGE_ADMIN_TOKEN.
metadata_dir = "/var/lib/garage/meta"
data_dir = "/var/lib/garage/data"
db_engine = "sqlite"

replication_factor = 1

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "127.0.0.1:3901"

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"

[admin]
api_bind_addr = "[::]:3903"
```

- [ ] **Step 2: `backend/src/storage/garage-init.ts`**

```ts
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
```

- [ ] **Step 3: Dev compose.** Στο `docker-compose.yml` πρόσθεσε πριν από το `backend`:

```yaml
  # Αποθήκευση ανεβασμένων αρχείων (S3). Μόνο στο εσωτερικό δίκτυο.
  garage:
    image: dxflrs/garage:v2.4.1
    environment:
      GARAGE_RPC_SECRET: ${GARAGE_RPC_SECRET:-0000000000000000000000000000000000000000000000000000000000000001}
      GARAGE_ADMIN_TOKEN: ${GARAGE_ADMIN_TOKEN:-dev-garage-admin-token}
    volumes:
      - ./garage/garage.toml:/etc/garage.toml:ro
      - garage_meta:/var/lib/garage/meta
      - garage_data:/var/lib/garage/data

  # Στήνει layout, bucket και κλειδί στο Garage και τελειώνει
  garage-init:
    build: ./backend
    command: ["node", "dist/src/storage/garage-init.js"]
    environment:
      GARAGE_ADMIN_TOKEN: ${GARAGE_ADMIN_TOKEN:-dev-garage-admin-token}
      S3_ENDPOINT: http://garage:3900
      S3_REGION: garage
      S3_BUCKET: ${S3_BUCKET:-koryfes}
      S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID:-GK0123456789abcdef01234567}
      S3_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY:-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef}
    depends_on:
      - garage
```

Στο `backend` πρόσθεσε τις τιμές S3 στο `environment` (γράψε τις πέντε γραμμές `S3_*` ρητά, με τις ίδιες προεπιλογές όπως στο `garage-init`) και άλλαξε το `depends_on` σε:

```yaml
    depends_on:
      db:
        condition: service_started
      garage-init:
        condition: service_completed_successfully
```

Στο τέλος: `volumes:` → πρόσθεσε `garage_meta:` και `garage_data:`. Το volume `./backend/uploads:/usr/src/app/uploads` μένει (για τη μεταφορά των παλιών αρχείων).

- [ ] **Step 4: Prod compose.** Στο `docker-compose.prod.yml` πρόσθεσε:

```yaml
  # Αποθήκευση ανεβασμένων αρχείων (S3). Χωρίς δημοσιευμένη θύρα.
  garage:
    image: dxflrs/garage:v2.4.1
    restart: always
    logging: *logging
    environment:
      GARAGE_RPC_SECRET: ${GARAGE_RPC_SECRET:?GARAGE_RPC_SECRET must be set}
      GARAGE_ADMIN_TOKEN: ${GARAGE_ADMIN_TOKEN:?GARAGE_ADMIN_TOKEN must be set}
    volumes:
      - ./garage.toml:/etc/garage.toml:ro
      - garage_meta:/var/lib/garage/meta
      - garage_data:/var/lib/garage/data

  garage-init:
    image: ghcr.io/athamour1/koryfes/backend:${TAG:-latest}
    restart: "no"
    logging: *logging
    command: ["node", "dist/src/storage/garage-init.js"]
    environment:
      GARAGE_ADMIN_TOKEN: ${GARAGE_ADMIN_TOKEN:?GARAGE_ADMIN_TOKEN must be set}
      S3_BUCKET: ${S3_BUCKET:-koryfes}
      S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID:?S3_ACCESS_KEY_ID must be set}
      S3_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY:?S3_SECRET_ACCESS_KEY must be set}
    depends_on:
      - garage
```

Στο `backend` πρόσθεσε στο `environment`:

```yaml
      S3_ENDPOINT: http://garage:3900
      S3_REGION: garage
      S3_BUCKET: ${S3_BUCKET:-koryfes}
      S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID:?S3_ACCESS_KEY_ID must be set}
      S3_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY:?S3_SECRET_ACCESS_KEY must be set}
```

και στο `depends_on` του backend πρόσθεσε `garage-init: { condition: service_completed_successfully }`. Πρόσθεσε `garage_meta:` και `garage_data:` στα `volumes:`. Το `./uploads` μένει. Επειδή στο prod υπάρχει μόνο το compose αρχείο, το `garage.toml` πρέπει να αντιγραφεί στον server δίπλα του: γράψ' το στο DEPLOYMENT.md (Step 6).

- [ ] **Step 5: Env examples.** Στο `.env.example` πρόσθεσε:

```
# Garage S3 (dev defaults work as-is)
# GARAGE_RPC_SECRET=
# GARAGE_ADMIN_TOKEN=
# S3_BUCKET=koryfes
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
```

Στο `.env.production.example` πρόσθεσε:

```
# Garage S3 storage for uploads. Generate once and keep them:
#   GARAGE_RPC_SECRET    — openssl rand -hex 32
#   GARAGE_ADMIN_TOKEN   — openssl rand -base64 32
#   S3_ACCESS_KEY_ID     — echo GK$(openssl rand -hex 12)
#   S3_SECRET_ACCESS_KEY — openssl rand -hex 32
GARAGE_RPC_SECRET=
GARAGE_ADMIN_TOKEN=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
# S3_BUCKET=koryfes
```

- [ ] **Step 6: `devops/DEPLOYMENT.md`.**
  - Στον πίνακα του `.env.production` πρόσθεσε τις τέσσερις μεταβλητές, με τις εντολές του Step 5.
  - Στη λίστα αρχείων του server πρόσθεσε το `garage.toml` (από το `garage/garage.toml` του repo).
  - Στο backup: τα volumes `garage_meta` και `garage_data` κρατούν τώρα τα αρχεία. Το `./uploads` κρατιέται μόνο μέχρι να επιβεβαιωθεί η μεταφορά.

- [ ] **Step 7: Επαλήθευση με το πραγματικό Garage.** Χρειάζεται build του backend, γιατί το init είναι μέσα στο image:

```bash
cd /home/thanos98/Develope/koryfes && docker compose up -d --build garage garage-init && sleep 5 && docker compose logs garage-init
```

Αναμενόμενο: `garage-init: ready`, exit 0. Αν κάποιο αίτημα επιστρέψει 400, το μήνυμα σφάλματος του Garage λέει ποιο πεδίο λείπει. Διόρθωσε το σώμα στο `garage-init.ts` σύμφωνα με το https://garagehq.deuxfleurs.fr/api/garage-admin-v2.json (π.χ. αν το `UpdateClusterLayout` θέλει `parameters`). Ξανατρέξε το `docker compose up -d garage-init` και επιβεβαίωσε ότι στη δεύτερη εκτέλεση τυπώνει μόνο `ready` (idempotent).

```bash
docker compose -f docker-compose.prod.yml config >/dev/null; echo $?   # αναμενόμενο: σφάλμα για τα :? (δεν έχουν οριστεί)
GARAGE_RPC_SECRET=x GARAGE_ADMIN_TOKEN=x S3_ACCESS_KEY_ID=x S3_SECRET_ACCESS_KEY=x DB_PASSWORD=x JWT_SECRET=x docker compose -f docker-compose.prod.yml config >/dev/null; echo $?   # αναμενόμενο: 0
```

---

### Task 2: StorageService, σερβίρισμα `/uploads` και μεταφορά παλιών αρχείων

**Files:**
- Create: `backend/src/storage/storage.service.ts`, `storage.module.ts`, `uploads.controller.ts`, `legacy-uploads.ts`, `upload-paths.ts`, `backend/test/in-memory-storage.ts`, `backend/test/uploads.e2e-spec.ts`
- Modify: `backend/src/app.module.ts`, `backend/src/main.ts`, `backend/test/helpers.ts`, `backend/package.json`

**Interfaces:**
- Produces:
  - `StorageService` με `put(key: string, body: Buffer, contentType: string): Promise<void>`, `get(key: string): Promise<{ body: Readable; contentType?: string; contentLength?: number } | null>`, `exists(key: string): Promise<boolean>`, `delete(key: string): Promise<void>`.
  - `toUploadPath(key: string): string` (`'/uploads/' + key`).
  - `keyFromUploadPath(path: string | null | undefined): string | null`.
  - `newImageKey(prefix: string): string` (`${prefix}/${hex32}.webp`).
  - `InMemoryStorage` για τα tests, με τις ίδιες μεθόδους και επιπλέον `objects: Map<string, { body: Buffer; contentType: string }>`.
  - `createTestApp(storage?: InMemoryStorage)` που κάνει override το `StorageService`.

- [ ] **Step 1: Εξαρτήσεις.**

```bash
cd /home/thanos98/Develope/koryfes/backend && docker run --rm -v "$PWD":/app -w /app node:24-trixie npm install --save @aws-sdk/client-s3 sharp --ignore-scripts=false
```

Επιβεβαίωσε ότι άλλαξαν μόνο το `package.json` και το `package-lock.json`: `git status --short`. Σβήσε μετά το `node_modules` που έφτιαξε το container: `rm -rf node_modules`. Είναι για Linux glibc και δεν ήταν στο repo.

- [ ] **Step 2: Γράψε το failing test** `backend/test/uploads.e2e-spec.ts`:

```ts
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './helpers';
import { InMemoryStorage } from './in-memory-storage';

describe('GET /uploads/* (e2e)', () => {
    let app: NestExpressApplication;
    const storage = new InMemoryStorage();
    const http = () => request(app.getHttpServer());

    beforeAll(async () => {
        app = await createTestApp(storage);
        await storage.put('unit-flags/abc.webp', Buffer.from('webp-bytes'), 'image/webp');
    });

    afterAll(async () => {
        await app?.close();
    });

    it('serves a stored object with its content type and long cache', async () => {
        const res = await http().get('/uploads/unit-flags/abc.webp').expect(200);
        expect(res.headers['content-type']).toBe('image/webp');
        expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
        expect(res.body.toString()).toBe('webp-bytes');
    });

    it('returns 404 for a missing object', () => {
        return http().get('/uploads/unit-flags/missing.webp').expect(404);
    });

    it('never resolves paths outside the keys', async () => {
        await http().get('/uploads/..%2f..%2fetc%2fpasswd').expect(404);
        await http().get('/uploads/unit-flags/%2e%2e/abc.webp').expect(404);
    });

    it('is not rate limited', async () => {
        for (let i = 0; i < 120; i++) {
            await http().get('/uploads/unit-flags/abc.webp').expect(200);
        }
    });
});
```

- [ ] **Step 3: `backend/test/in-memory-storage.ts`**

```ts
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
```

Στο `backend/test/helpers.ts` άλλαξε το `createTestApp`:

```ts
import { StorageService } from '../src/storage/storage.service';
import { InMemoryStorage } from './in-memory-storage';

export async function createTestApp(storage = new InMemoryStorage()): Promise<NestExpressApplication> {
    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(StorageService)
        .useValue(storage)
        .compile();

    const app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    return app;
}
```

- [ ] **Step 4: Τρέξε τα tests και επιβεβαίωσε ότι αποτυγχάνουν.** Εντολή e2e με `<PATTERN>` = `uploads`. Αναμενόμενο: αποτυχία compile, γιατί το `../src/storage/storage.service` δεν υπάρχει.

- [ ] **Step 5: `backend/src/storage/upload-paths.ts`**

```ts
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
```

- [ ] **Step 6: `backend/src/storage/storage.service.ts`**

```ts
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
```

- [ ] **Step 7: `backend/src/storage/uploads.controller.ts`**

```ts
import { Controller, Get, NotFoundException, Req, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from 'express';
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
        const key = decodeURIComponent(Array.isArray(raw) ? raw.join('/') : raw);
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
        object.body.pipe(res);
    }
}
```

- [ ] **Step 8: `backend/src/storage/legacy-uploads.ts`**

```ts
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
```

- [ ] **Step 9: `backend/src/storage/storage.module.ts`**

```ts
import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { UploadsController } from './uploads.controller';
import { LegacyUploadsMigrator } from './legacy-uploads';

@Global()
@Module({
    controllers: [UploadsController],
    providers: [StorageService, LegacyUploadsMigrator],
    exports: [StorageService],
})
export class StorageModule { }
```

- [ ] **Step 10: Αφαίρεση του static serving.**
  - Στο `backend/src/app.module.ts`: σβήσε το import του `ServeStaticModule` και το block `ServeStaticModule.forRoot({...})`. Πρόσθεσε `import { StorageModule } from './storage/storage.module';` και το `StorageModule` στα `imports`.
  - Στο `backend/src/main.ts`: σβήσε το block «Serve static files from uploads directory» μέχρι και το `app.useStaticAssets(...)`, μαζί με το import του `join` αν μείνει αχρησιμοποίητο.
  - Αφαίρεσε το `@nestjs/serve-static` από το `package.json` μόνο αν δεν χρησιμοποιείται πουθενά αλλού (`grep -rn serve-static backend/src`).

- [ ] **Step 11: Πρόσθεσε στο `uploads.e2e-spec.ts` test για τη μεταφορά παλιών αρχείων:**

```ts
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('legacy uploads migration (e2e)', () => {
    it('copies files from UPLOADS_DIR into the bucket once', async () => {
        const dir = mkdtempSync(join(tmpdir(), 'uploads-'));
        mkdirSync(join(dir, 'unit-flags'));
        writeFileSync(join(dir, 'unit-flags', 'old.png'), Buffer.from('png-bytes'));
        writeFileSync(join(dir, 'unit-flags', 'notes.txt'), 'ignored');
        process.env.UPLOADS_DIR = dir;
        const storage = new InMemoryStorage();
        const app = await createTestApp(storage);
        try {
            expect(storage.objects.get('unit-flags/old.png')).toEqual({ body: Buffer.from('png-bytes'), contentType: 'image/png' });
            expect(storage.objects.has('unit-flags/notes.txt')).toBe(false);
        } finally {
            delete process.env.UPLOADS_DIR;
            await app.close();
        }
    });
});
```

- [ ] **Step 12: Τρέξε τα tests.** Εντολή e2e με `<PATTERN>` = `uploads`. Αναμενόμενο: PASS σε όλα. Μετά τρέξε όλα τα e2e (κενό pattern). Αναμενόμενο: όλα PASS.

- [ ] **Step 13: Commit** (μαζί και τα αρχεία του Task 1, που δεν είχε δικό του commit γιατί το init χρειάζεται το build του backend)

```bash
git add backend/package.json backend/package-lock.json backend/src/storage backend/src/app.module.ts backend/src/main.ts backend/test garage docker-compose.yml docker-compose.prod.yml .env.example .env.production.example devops/DEPLOYMENT.md
git commit -m "feat(storage): keep uploads in Garage S3 and serve them from the bucket"
```

---

### Task 3: Επεξεργασία εικόνων με sharp και σημαίες στο S3

**Files:**
- Modify: `backend/src/common/image-upload.ts`, `backend/src/units/units.controller.ts`, `backend/src/units/units.service.ts`
- Test: `backend/test/security.e2e-spec.ts` (υπάρχον test μη-εικόνας), `backend/test/unit-photos.e2e-spec.ts` (νέο, το ξεκινάει αυτό το task)

**Interfaces:**
- Consumes: `StorageService`, `newImageKey`, `toUploadPath`, `keyFromUploadPath` (Task 2).
- Produces:
  - `imageUploadOptions(): MulterOptions` (memory storage, χωρίς όρισμα).
  - `processImage(buffer: Buffer, maxSide: number): Promise<Buffer>`: WebP, `rotate()`, χωρίς EXIF, 400 για μη αναγνώσιμα.
  - `IMAGE_MAX_SIDE = { photo: 1600, flag: 800 }`.
  - `UnitsService.updateFlag(id, file: Buffer)`: σβήνει την παλιά σημαία από το S3.

- [ ] **Step 1: Failing tests.** Δημιούργησε το `backend/test/unit-photos.e2e-spec.ts` με τα tests της σημαίας:

```ts
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import sharp from 'sharp';
import { UserRole } from '../src/users/entities/user.entity';
import { createTestApp, login, seedLocation, seedUnit, seedUser } from './helpers';
import { InMemoryStorage } from './in-memory-storage';

// 3000x2000 JPEG with EXIF (orientation + a GPS-like comment) for the resize/strip checks
export const bigJpeg = () =>
    sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#3a7' } })
        .jpeg()
        .withMetadata({ orientation: 1, exif: { IFD0: { ImageDescription: 'gps 37.98,23.73' } } })
        .toBuffer();

describe('Unit images (e2e)', () => {
    let app: NestExpressApplication;
    const storage = new InMemoryStorage();
    const http = () => request(app.getHttpServer());
    let superToken: string;
    let unitA: { id: number };

    beforeAll(async () => {
        app = await createTestApp(storage);
        const locA = await seedLocation(app, 'Photos A');
        unitA = await seedUnit(app, 'Unit A', locA);
        await seedUser(app, 'photosSuper', UserRole.SUPER_ADMIN);
        superToken = await login(app, 'photosSuper');
    });

    afterAll(async () => {
        await app?.close();
    });

    describe('POST /units/:id/image (flag)', () => {
        it('stores a resized WebP without EXIF and replaces the old flag', async () => {
            const first = await http()
                .post(`/units/${unitA.id}/image`)
                .set('Authorization', `Bearer ${superToken}`)
                .attach('file', await bigJpeg(), { filename: 'flag.jpg', contentType: 'image/jpeg' })
                .expect(201);
            const firstKey = first.body.flag.replace('/uploads/', '');
            const stored = storage.objects.get(firstKey);
            expect(stored.contentType).toBe('image/webp');
            const meta = await sharp(stored.body).metadata();
            expect(meta.format).toBe('webp');
            expect(Math.max(meta.width, meta.height)).toBe(800);
            expect(meta.exif).toBeUndefined();

            const second = await http()
                .post(`/units/${unitA.id}/image`)
                .set('Authorization', `Bearer ${superToken}`)
                .attach('file', await bigJpeg(), { filename: 'flag.jpg', contentType: 'image/jpeg' })
                .expect(201);
            expect(second.body.flag).not.toBe(first.body.flag);
            expect(storage.objects.has(firstKey)).toBe(false);
        });

        it('rejects a file that claims to be an image but is not', () => {
            return http()
                .post(`/units/${unitA.id}/image`)
                .set('Authorization', `Bearer ${superToken}`)
                .attach('file', Buffer.from('not really a png'), { filename: 'x.png', contentType: 'image/png' })
                .expect(400);
        });
    });
});
```

- [ ] **Step 2: Τρέξε και επιβεβαίωσε την αποτυχία.** `<PATTERN>` = `unit-photos`. Αναμενόμενο: FAIL. Η σημαία γράφεται ακόμα σε δίσκο, οπότε το `storage.objects.get` δίνει undefined.

- [ ] **Step 3: `backend/src/common/image-upload.ts`** (ολόκληρο)

```ts
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
```

- [ ] **Step 4: Σημαία μέσω S3.** Στο `units.service.ts`:

```ts
import { StorageService } from '../storage/storage.service';
import { keyFromUploadPath, newImageKey, toUploadPath } from '../storage/upload-paths';
import { IMAGE_MAX_SIDE, processImage } from '../common/image-upload';

// στον constructor πρόσθεσε: private readonly storage: StorageService,

    async updateFlag(id: number, file: Buffer): Promise<Unit> {
        const unit = await this.findOne(id);
        const key = newImageKey('unit-flags');
        await this.storage.put(key, await processImage(file, IMAGE_MAX_SIDE.flag), 'image/webp');
        await this.unitsRepository.update(id, { flag: toUploadPath(key) });
        const oldKey = keyFromUploadPath(unit.flag);
        if (oldKey) {
            await this.storage.delete(oldKey);
        }
        return this.findOne(id);
    }
```

Στο `units.controller.ts`: `@UseInterceptors(FileInterceptor('file', imageUploadOptions()))` και στο τέλος του `uploadFlag` γράψε `return this.unitsService.updateFlag(+id, file.buffer);`.

- [ ] **Step 5: Τρέξε τα tests.** `<PATTERN>` = `unit-photos|security`. Αναμενόμενο: PASS, μαζί με το υπάρχον «rejects non-image uploads».

- [ ] **Step 6: Commit**

```bash
git add backend/src/common/image-upload.ts backend/src/units backend/test/unit-photos.e2e-spec.ts
git commit -m "feat(images): re-encode uploads as stripped, resized WebP"
```

---

### Task 4: Φωτογραφίες ενωμοτίας (backend)

**Files:**
- Create: `backend/src/units/entities/unit-photo.entity.ts`, `backend/src/units/unit-access.ts`, `backend/src/units/unit-photos.service.ts`, `backend/src/migrations/1791700000000-UnitPhotos.ts`
- Modify: `backend/src/units/entities/unit.entity.ts`, `units.module.ts`, `units.controller.ts`, `units.service.ts`
- Test: `backend/test/unit-photos.e2e-spec.ts`

**Interfaces:**
- Consumes:
  - `processImage`, `IMAGE_MAX_SIDE`, `imageUploadOptions` (Task 3).
  - `StorageService`, `newImageKey`, `toUploadPath`, `keyFromUploadPath` (Task 2).
- Produces:
  - `UnitPhotoKind = 'corner' | 'activity'`, `MAX_ACTIVITY_PHOTOS = 9`.
  - Οντότητα `UnitPhoto { id; kind; path; createdAt; unit }`.
  - `assertCanEditUnit(user: { role: string; locationId?: number; unitId?: number; unitRole?: string }, unit: Unit): void` (ρίχνει `UnauthorizedException`).
  - `UnitPhotosService.add(unit: Unit, kind: UnitPhotoKind, file: Buffer): Promise<UnitPhoto>`, `UnitPhotosService.remove(unitId: number, photoId: number): Promise<void>`, `UnitPhotosService.removeAllObjects(unitId: number): Promise<void>`.
  - Το `GET /units/:id` επιστρέφει `photos: { id, kind, path, createdAt }[]`, με τις δράσεις κατά `createdAt` αύξουσα.
  - `POST /units/:id/photos?kind=corner|activity` → `UnitPhoto`. `DELETE /units/:id/photos/:photoId` → 200.

- [ ] **Step 1: Failing tests.** Πρόσθεσε στο `unit-photos.e2e-spec.ts`, μέσα στο ίδιο `describe` (επέκτεινε το `beforeAll` όπως φαίνεται):

```ts
    // στο beforeAll, μετά το superToken:
    //   const locB = await seedLocation(app, 'Photos B');
    //   unitB = await seedUnit(app, 'Unit B', locB);
    //   const leaderA = await seedUser(app, 'leaderA', UserRole.USER, locA);
    //   const memberA = await seedUser(app, 'memberA', UserRole.USER, locA);
    //   await seedUser(app, 'adminB', UserRole.ADMIN, locB);
    //   const ds = app.get(DataSource);
    //   await ds.getRepository(User).update(leaderA.id, { unit: { id: unitA.id }, unitRole: UnitRole.LEADER });
    //   await ds.getRepository(User).update(memberA.id, { unit: { id: unitA.id }, unitRole: UnitRole.MEMBER });
    //   leaderToken = await login(app, 'leaderA');
    //   memberToken = await login(app, 'memberA');
    //   adminBToken = await login(app, 'adminB');
    //   photoJpeg = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: '#a73' } }).jpeg().toBuffer();
    // (δήλωσε στο describe: let unitB, leaderToken, memberToken, adminBToken, photoJpeg: Buffer)
    // (imports: DataSource από 'typeorm', User, UnitRole από '../src/users/entities/user.entity')

    const upload = (token: string, unitId: number, kind: string) =>
        http()
            .post(`/units/${unitId}/photos?kind=${kind}`)
            .set('Authorization', `Bearer ${token}`)
            .attach('file', photoJpeg, {
                filename: 'p.jpg',
                contentType: 'image/jpeg',
            });

    describe('POST /units/:id/photos', () => {
        it('lets the unit leader add up to 9 activity photos, resized to 1600px', async () => {
            for (let i = 0; i < 9; i++) {
                const res = await upload(leaderToken, unitA.id, 'activity').expect(201);
                const meta = await sharp(storage.objects.get(res.body.path.replace('/uploads/', '')).body).metadata();
                expect(meta.width).toBe(1600);
            }
            await upload(leaderToken, unitA.id, 'activity').expect(400);
            const unit = await http().get(`/units/${unitA.id}`).set('Authorization', `Bearer ${leaderToken}`).expect(200);
            expect(unit.body.photos.filter((p) => p.kind === 'activity')).toHaveLength(9);
        });

        it('keeps a single corner photo and deletes the replaced object', async () => {
            const first = await upload(leaderToken, unitA.id, 'corner').expect(201);
            const second = await upload(leaderToken, unitA.id, 'corner').expect(201);
            const unit = await http().get(`/units/${unitA.id}`).set('Authorization', `Bearer ${leaderToken}`).expect(200);
            expect(unit.body.photos.filter((p) => p.kind === 'corner').map((p) => p.id)).toEqual([second.body.id]);
            expect(storage.objects.has(first.body.path.replace('/uploads/', ''))).toBe(false);
        });

        it('rejects an unknown kind', () => upload(leaderToken, unitA.id, 'selfie').expect(400));

        it('rejects a plain member, another unit\'s leader and another location\'s admin', async () => {
            await upload(memberToken, unitA.id, 'activity').expect(401);
            await upload(leaderToken, unitB.id, 'activity').expect(401);
            await upload(adminBToken, unitA.id, 'activity').expect(401);
        });
    });

    describe('DELETE /units/:id/photos/:photoId', () => {
        it('removes the photo and its object', async () => {
            const unit = await http().get(`/units/${unitA.id}`).set('Authorization', `Bearer ${leaderToken}`).expect(200);
            const photo = unit.body.photos.find((p) => p.kind === 'activity');
            await http().delete(`/units/${unitA.id}/photos/${photo.id}`).set('Authorization', `Bearer ${leaderToken}`).expect(200);
            expect(storage.objects.has(photo.path.replace('/uploads/', ''))).toBe(false);
        });

        it('returns 404 for a photo of another unit and deletes nothing', async () => {
            const own = await upload(superToken, unitB.id, 'corner').expect(201);
            await http().delete(`/units/${unitA.id}/photos/${own.body.id}`).set('Authorization', `Bearer ${superToken}`).expect(404);
            expect(storage.objects.has(own.body.path.replace('/uploads/', ''))).toBe(true);
        });
    });

    describe('DELETE /units/:id', () => {
        it('deletes the unit\'s objects from storage', async () => {
            const unit = await http().get(`/units/${unitB.id}`).set('Authorization', `Bearer ${superToken}`).expect(200);
            const keys = unit.body.photos.map((p) => p.path.replace('/uploads/', ''));
            expect(keys.length).toBeGreaterThan(0);
            await http().delete(`/units/${unitB.id}`).set('Authorization', `Bearer ${superToken}`).expect(200);
            keys.forEach((k) => expect(storage.objects.has(k)).toBe(false));
        });
    });
```

- [ ] **Step 2: Τρέξε και επιβεβαίωσε την αποτυχία.** `<PATTERN>` = `unit-photos`. Αναμενόμενο: FAIL με 404 στο `POST /units/:id/photos`.

- [ ] **Step 3: Οντότητα** `backend/src/units/entities/unit-photo.entity.ts`:

```ts
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Unit } from './unit.entity';

export type UnitPhotoKind = 'corner' | 'activity';
export const UNIT_PHOTO_KINDS: UnitPhotoKind[] = ['corner', 'activity'];
export const MAX_ACTIVITY_PHOTOS = 9;

/** A unit's gallery: one photo of its corner and up to 9 of its activities. */
@Entity()
export class UnitPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'simple-enum', enum: UNIT_PHOTO_KINDS })
    kind: UnitPhotoKind;

    @Column()
    path: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Unit, (unit) => unit.photos, { onDelete: 'CASCADE' })
    unit: Unit;
}
```

Στο `unit.entity.ts` πρόσθεσε `import { UnitPhoto } from './unit-photo.entity';` και:

```ts
    @OneToMany(() => UnitPhoto, (photo) => photo.unit)
    photos: UnitPhoto[];
```

- [ ] **Step 4: Migration** `backend/src/migrations/1791700000000-UnitPhotos.ts`:

```ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/** Unit gallery: one corner photo and up to 9 activity photos per unit. */
export class UnitPhotos1791700000000 implements MigrationInterface {
    name = 'UnitPhotos1791700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."unit_photo_kind_enum" AS ENUM('corner', 'activity')`);
        await queryRunner.query(`CREATE TABLE "unit_photo" ("id" SERIAL NOT NULL, "kind" "public"."unit_photo_kind_enum" NOT NULL, "path" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "unitId" integer, CONSTRAINT "PK_unit_photo_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "unit_photo" ADD CONSTRAINT "FK_unit_photo_unit" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "unit_photo" DROP CONSTRAINT "FK_unit_photo_unit"`);
        await queryRunner.query(`DROP TABLE "unit_photo"`);
        await queryRunner.query(`DROP TYPE "public"."unit_photo_kind_enum"`);
    }
}
```

- [ ] **Step 5: Κοινός έλεγχος δικαιωμάτων** `backend/src/units/unit-access.ts`:

```ts
import { UnauthorizedException } from '@nestjs/common';
import { Unit } from './entities/unit.entity';

export interface UnitEditor {
    role: string;
    locationId?: number;
    unitId?: number;
    unitRole?: string;
}

/**
 * Who may change a unit's flag, yell and photos: a super admin, the admin of
 * the unit's location, or the unit's own leader.
 */
export function assertCanEditUnit(user: UnitEditor, unit: Unit): void {
    if (user.role === 'super_admin') return;
    if (user.role === 'admin' && unit.location?.id === user.locationId) return;
    if (user.role === 'user' && user.unitId === unit.id && user.unitRole === 'leader') return;
    throw new UnauthorizedException('You do not have permission to edit this unit');
}
```

Στο `units.controller.ts`, στα `update` και `uploadFlag`, αντικατάστησε τα blocks `isSuperAdmin/isAdmin/isUnitLeader` και τους ελέγχους τοπικού με:

```ts
        const unit = await this.unitsService.findOne(unitId);
        assertCanEditUnit(req.user, unit);
```

Στο `update`, κράτα τον περιορισμό πεδίων για τον Ενωμοτάρχη (`description`, `flag`) και το `delete updateUnitDto.location` για τον admin, με βάση το `req.user.role`.

- [ ] **Step 6: `backend/src/units/unit-photos.service.ts`**

```ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MAX_ACTIVITY_PHOTOS, UnitPhoto, UnitPhotoKind } from './entities/unit-photo.entity';
import { Unit } from './entities/unit.entity';
import { StorageService } from '../storage/storage.service';
import { keyFromUploadPath, newImageKey, toUploadPath } from '../storage/upload-paths';
import { IMAGE_MAX_SIDE, processImage } from '../common/image-upload';

@Injectable()
export class UnitPhotosService {
    constructor(
        @InjectRepository(UnitPhoto)
        private readonly photos: Repository<UnitPhoto>,
        private readonly storage: StorageService,
    ) { }

    async add(unit: Unit, kind: UnitPhotoKind, file: Buffer): Promise<UnitPhoto> {
        const existing = await this.photos.find({ where: { unit: { id: unit.id }, kind } });
        if (kind === 'activity' && existing.length >= MAX_ACTIVITY_PHOTOS) {
            throw new BadRequestException(`A unit can have at most ${MAX_ACTIVITY_PHOTOS} activity photos`);
        }
        const key = newImageKey(`unit-photos/${unit.id}`);
        await this.storage.put(key, await processImage(file, IMAGE_MAX_SIDE.photo), 'image/webp');
        const photo = await this.photos.save(this.photos.create({ unit: { id: unit.id }, kind, path: toUploadPath(key) }));
        if (kind === 'corner') {
            // the corner has one photo: the new one replaces the old
            for (const old of existing) {
                await this.deleteRowAndObject(old);
            }
        }
        const { unit: _unit, ...saved } = photo;
        return saved as UnitPhoto;
    }

    async remove(unitId: number, photoId: number): Promise<void> {
        const photo = await this.photos.findOne({ where: { id: photoId, unit: { id: unitId } } });
        if (!photo) {
            throw new NotFoundException('Photo not found');
        }
        await this.deleteRowAndObject(photo);
    }

    /** Before a unit is deleted (rows go by cascade, objects don't). */
    async removeAllObjects(unitId: number): Promise<void> {
        const photos = await this.photos.find({ where: { unit: { id: unitId } } });
        for (const photo of photos) {
            const key = keyFromUploadPath(photo.path);
            if (key) await this.storage.delete(key);
        }
    }

    private async deleteRowAndObject(photo: UnitPhoto) {
        await this.photos.delete(photo.id);
        const key = keyFromUploadPath(photo.path);
        if (key) await this.storage.delete(key);
    }
}
```

- [ ] **Step 7: Module, service, controller.**
  - `units.module.ts`: `TypeOrmModule.forFeature([Unit, UnitPhoto])`, `providers: [UnitsService, UnitPhotosService]`.
  - `units.service.ts`, `findOne`:

    ```ts
            relations: ['location', 'users', 'photos'],
            order: { photos: { createdAt: 'ASC', id: 'ASC' } },
    ```

  - `units.service.ts`, `remove`: πριν από το `delete`, σβήσε τη σημαία από το S3 (`keyFromUploadPath(unit.flag)`) και κάλεσε `await this.unitPhotos.removeAllObjects(id)`. Πρόσθεσε το `UnitPhotosService` στον constructor.
  - `units.controller.ts`:

```ts
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/photos')
    @UseInterceptors(FileInterceptor('file', imageUploadOptions()))
    async addPhoto(@Param('id') id: string, @Query('kind') kind: string, @UploadedFile() file: any, @Request() req) {
        if (!UNIT_PHOTO_KINDS.includes(kind as UnitPhotoKind)) {
            throw new BadRequestException('kind must be corner or activity');
        }
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const unit = await this.unitsService.findOne(+id);
        assertCanEditUnit(req.user, unit);
        return this.unitPhotos.add(unit, kind as UnitPhotoKind, file.buffer);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/photos/:photoId')
    async removePhoto(@Param('id') id: string, @Param('photoId') photoId: string, @Request() req) {
        const unit = await this.unitsService.findOne(+id);
        assertCanEditUnit(req.user, unit);
        await this.unitPhotos.remove(unit.id, +photoId);
        return { ok: true };
    }
```

  Inject με `private readonly unitPhotos: UnitPhotosService` στον constructor. Σημείωση: ο έλεγχος δικαιώματος γίνεται πριν από το multer μόνο για το kind. Το αρχείο διαβάζεται στη μνήμη πρώτα (όριο 5MB), όπως και στη σημαία.

- [ ] **Step 8: Τρέξε τα tests.** `<PATTERN>` = `unit-photos`, μετά όλα. Αναμενόμενο: όλα PASS.

- [ ] **Step 9: Επαλήθευση του migration σε Postgres.**

```bash
cd /home/thanos98/Develope/koryfes && docker compose up -d --build backend && sleep 8 && docker compose exec -T db psql -U postgres -d guide_badges -c '\d unit_photo' && docker compose logs backend | grep -i "migration\|error" | tail -5
```

Αναμενόμενο: ο πίνακας υπάρχει με `kind`, `path`, `createdAt`, `unitId` και FK, χωρίς σφάλματα.

- [ ] **Step 10: Commit**

```bash
git add backend/src backend/test
git commit -m "feat(units): corner and activity photo gallery"
```

---

### Task 5: Frontend: συμπίεση και actions του store

**Files:**
- Create: `frontend/src/utils/compressImage.js`
- Modify: `frontend/src/stores/unit.js`

**Interfaces:**
- Produces:
  - `compressImage(file: File, maxSide: number): Promise<File>` (WebP 0.8, JPEG fallback, GIF όπως είναι, ποτέ μεγαλύτερο από το αρχικό).
  - Store actions: `uploadUnitFlag(id, file)` (συμπιέζει στα 800), `uploadUnitPhoto(id, kind, file)` (συμπιέζει στα 1600 και προσθέτει στο `currentUnit.photos`· στη γωνιά αφαιρεί την παλιά), `deleteUnitPhoto(id, photoId)`. Όλες επιστρέφουν το αποτέλεσμα ή `null` και γράφουν `this.error`.

- [ ] **Step 1: `frontend/src/utils/compressImage.js`**

```js
// Μικραίνει μια φωτογραφία στον browser πριν ανέβει, ώστε να μη στέλνονται
// megabytes. Ο server την ξανακωδικοποιεί ούτως ή άλλως· αυτό γλιτώνει το ανέβασμα.
const QUALITY = 0.8;

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
  img.src = url;
});

const toBlob = (canvas, type) => new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));

export async function compressImage(file, maxSide) {
  // τα GIF μπορεί να είναι κινούμενα· τα αφήνουμε στον server
  if (file.type === 'image/gif') return file;

  let img;
  try {
    img = await loadImage(file);
  } catch {
    return file; // ας αποφασίσει ο server (θα δώσει 400 αν δεν είναι εικόνα)
  }

  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

  let blob = await toBlob(canvas, 'image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg');
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type: blob.type });
}
```

- [ ] **Step 2: Store.** Στο `frontend/src/stores/unit.js`:
  - πρόσθεσε `import { compressImage } from '@/utils/compressImage';`
  - στο `uploadUnitFlag`, πριν από το `formData.append`, πρόσθεσε `file = await compressImage(file, 800);`
  - πρόσθεσε τα actions:

```js
        async uploadUnitPhoto(id, kind, file) {
            this.error = null;
            try {
                const formData = new FormData();
                formData.append('file', await compressImage(file, 1600));
                const response = await api.post(`/units/${id}/photos`, formData, {
                    params: { kind },
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (this.currentUnit && this.currentUnit.id === id) {
                    const others = (this.currentUnit.photos || []).filter(p => kind !== 'corner' || p.kind !== 'corner');
                    this.currentUnit.photos = [...others, response.data];
                }
                return response.data;
            } catch (error) {
                console.error('Error uploading unit photo:', error);
                this.error = error.response?.data?.message || 'Failed to upload photo';
                return null;
            }
        },

        async deleteUnitPhoto(id, photoId) {
            this.error = null;
            try {
                await api.delete(`/units/${id}/photos/${photoId}`);
                if (this.currentUnit && this.currentUnit.id === id) {
                    this.currentUnit.photos = this.currentUnit.photos.filter(p => p.id !== photoId);
                }
                return true;
            } catch (error) {
                console.error('Error deleting unit photo:', error);
                this.error = error.response?.data?.message || 'Failed to delete photo';
                return false;
            }
        },
```

(Δεν πειράζουν το `loading`, ώστε η σελίδα να μη δείχνει spinner σε κάθε ανέβασμα.)

- [ ] **Step 3: Έλεγχος build.** `cd /home/thanos98/Develope/koryfes && docker compose build frontend 2>&1 | grep -iE "error" ; echo done`. Αναμενόμενο: κανένα σφάλμα.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/utils/compressImage.js frontend/src/stores/unit.js
git commit -m "feat(frontend): compress images before upload, unit photo actions"
```

---

### Task 6: Frontend: η μία σελίδα ενωμοτίας (προβολή και επεξεργασία)

**Files:**
- Create: `frontend/src/components/unit/PhotoTile.vue`, `frontend/src/components/unit/PhotoLightbox.vue`
- Modify (rewrite): `frontend/src/pages/UnitPage.vue`, `frontend/src/pages/MyUnitPage.vue`
- Modify: `frontend/src/i18n/locales/el.json`, `en.json`

**Interfaces:**
- Consumes: store actions του Task 5. Το `currentUnit.photos` είναι `[{ id, kind, path, createdAt }]`. Το `authStore.user` έχει `{ role, location, unit, unitRole }` και το `authStore.isSuperAdmin`.
- Produces: το route `/units/:id` κάνει προβολή και επεξεργασία. Το `/my-unit` κάνει redirect στο `/units/<id>` ή δείχνει κενή κατάσταση.

- [ ] **Step 1: i18n.** Στο `el.json`, μέσα στο `unitPage`, πρόσθεσε:

```json
        "edit": "Επεξεργασία",
        "done": "Τέλος",
        "yell": "Κραυγή",
        "corner": "Η Γωνιά μας",
        "noCorner": "Δεν έχει ανέβει φωτογραφία της γωνιάς ακόμα.",
        "activities": "Δράσεις",
        "noActivities": "Δεν έχουν ανέβει φωτογραφίες δράσεων ακόμα.",
        "addPhoto": "Προσθήκη φωτογραφίας",
        "changePhoto": "Αλλαγή φωτογραφίας",
        "removePhoto": "Αφαίρεση",
        "changeFlag": "Αλλαγή σημαίας",
        "uploadError": "Η φωτογραφία δεν ανέβηκε",
        "saved": "Αποθηκεύτηκε",
        "confirmRemove": "Να αφαιρεθεί η φωτογραφία;"
```

Στο `en.json`, μέσα στο `unitPage`, πρόσθεσε τα ίδια κλειδιά: `"Edit"`, `"Done"`, `"Yell"`, `"Our corner"`, `"No photo of the corner yet."`, `"Activities"`, `"No activity photos yet."`, `"Add photo"`, `"Change photo"`, `"Remove"`, `"Change flag"`, `"The photo was not uploaded"`, `"Saved"`, `"Remove this photo?"`.

- [ ] **Step 2: `frontend/src/components/unit/PhotoTile.vue`**

```vue
<template>
  <!-- Ένα πλακίδιο της γκαλερί: φωτογραφία (πατιέται για μεγέθυνση) ή, σε
       επεξεργασία, κενή θέση «+». Σε επεξεργασία δείχνει αλλαγή/αφαίρεση. -->
  <div class="photo-tile" :class="{ 'photo-tile--empty': !src }" :style="{ aspectRatio: ratio }">
    <img v-if="src" :src="src" alt="" loading="lazy" @click="$emit('open')" />
    <button v-else-if="editing" type="button" class="photo-tile__add" :disabled="busy" @click="pick">
      <q-spinner v-if="busy" size="28px" />
      <template v-else>
        <q-icon name="add_a_photo" size="28px" />
        <span>{{ $t('unitPage.addPhoto') }}</span>
      </template>
    </button>
    <div v-if="src && editing" class="photo-tile__actions">
      <q-btn v-if="replaceable" round dense size="sm" color="white" text-color="dark" icon="edit" :loading="busy" @click="pick">
        <q-tooltip>{{ $t('unitPage.changePhoto') }}</q-tooltip>
      </q-btn>
      <q-btn round dense size="sm" color="white" text-color="negative" icon="delete" :disable="busy" @click="$emit('remove')">
        <q-tooltip>{{ $t('unitPage.removePhoto') }}</q-tooltip>
      </q-btn>
    </div>
    <input ref="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden @change="onFile" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  src: { type: String, default: null },
  editing: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  // η γωνιά αλλάζει επί τόπου· οι δράσεις μόνο αφαιρούνται
  replaceable: { type: Boolean, default: false },
  ratio: { type: String, default: '4 / 3' },
});
const emit = defineEmits(['open', 'remove', 'file']);

const input = ref(null);
const pick = () => input.value?.click();
const onFile = (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (file) emit('file', file);
};
</script>

<style scoped>
.photo-tile {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid var(--border-soft);
  background: var(--surface-2);
}
.photo-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  display: block;
}
.photo-tile--empty {
  border-style: dashed;
}
.photo-tile__add {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: var(--klados-ink);
  font-size: 0.85rem;
}
.photo-tile__add:hover {
  background: color-mix(in srgb, var(--klados-color) 8%, transparent);
}
.photo-tile__actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
}
</style>
```

- [ ] **Step 3: `frontend/src/components/unit/PhotoLightbox.vue`**

```vue
<template>
  <!-- Προβολή φωτογραφιών σε πλήρη οθόνη, με εναλλαγή μπρος-πίσω -->
  <q-dialog :model-value="modelValue !== null" maximized @update:model-value="(v) => !v && $emit('update:modelValue', null)">
    <div class="lightbox" @click.self="$emit('update:modelValue', null)">
      <q-btn round flat color="white" icon="close" class="lightbox__close" @click="$emit('update:modelValue', null)" />
      <q-carousel
        :model-value="modelValue"
        animated
        swipeable
        infinite
        arrows
        control-color="white"
        class="lightbox__carousel"
        @update:model-value="(i) => $emit('update:modelValue', i)"
      >
        <q-carousel-slide v-for="(src, i) in photos" :key="src" :name="i" class="lightbox__slide">
          <img :src="src" alt="" />
        </q-carousel-slide>
      </q-carousel>
    </div>
  </q-dialog>
</template>

<script setup>
defineProps({
  photos: { type: Array, required: true }, // URLs
  modelValue: { type: Number, default: null }, // index που φαίνεται, ή null
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.lightbox {
  background: rgba(0, 0, 0, 0.92);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lightbox__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}
.lightbox__carousel {
  background: transparent;
  width: 100%;
  height: 100%;
}
.lightbox__slide {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
}
.lightbox__slide img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
```

- [ ] **Step 4: `frontend/src/pages/UnitPage.vue`** (ολόκληρο)

```vue
<template>
  <q-page class="tf-page">
    <div v-if="loading" class="row justify-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <template v-else-if="unit">
      <div class="row items-center q-pt-md q-pb-sm">
        <q-btn flat dense no-caps icon="arrow_back" :label="$t('general.back')" color="primary" @click="$router.back()" />
        <q-space />
        <q-btn
          v-if="canEdit"
          :outline="!editing"
          :color="'primary'"
          no-caps
          :icon="editing ? 'check' : 'edit'"
          :label="editing ? $t('unitPage.done') : $t('unitPage.edit')"
          @click="toggleEditing"
        />
      </div>

      <!-- Καρτέλα ενωμοτίας: σημαία, όνομα, κραυγή -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <div class="unit-flag">
            <img v-if="unit.flag" :src="url(unit.flag)" :alt="unit.name" />
            <q-icon v-else name="flag" size="40px" />
            <q-btn
              v-if="editing"
              round
              dense
              size="sm"
              color="primary"
              icon="edit"
              class="unit-flag__edit"
              :loading="busy === 'flag'"
              @click="flagInput.click()"
            >
              <q-tooltip>{{ $t('unitPage.changeFlag') }}</q-tooltip>
            </q-btn>
            <input ref="flagInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden @change="onFlag" />
          </div>
          <div class="col">
            <h1 class="page-title">{{ unit.name }}</h1>
            <q-chip v-if="unit.location" dense square color="grey-2" text-color="grey-9" icon="place" class="q-ml-none">
              {{ unit.location.name }}
            </q-chip>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="tf-card-head"><q-icon name="campaign" />{{ $t('unitPage.yell') }}</div>
          <template v-if="editing">
            <q-input v-model="yell" outlined autogrow :maxlength="300" />
            <div class="row justify-end q-mt-sm">
              <q-btn color="primary" no-caps :label="$t('general.save')" :disable="yell === (unit.description || '')" :loading="busy === 'yell'" @click="saveYell" />
            </div>
          </template>
          <div v-else class="text-body1 yell">{{ unit.description || $t('unitPage.noDescription') }}</div>
        </q-card-section>
      </q-card>

      <!-- Η Γωνιά μας -->
      <section class="q-mb-lg">
        <div class="tf-card-head"><q-icon name="home" />{{ $t('unitPage.corner') }}</div>
        <PhotoTile
          v-if="corner || editing"
          class="corner-tile"
          ratio="16 / 9"
          :src="corner && url(corner.path)"
          :editing="editing"
          replaceable
          :busy="busy === 'corner'"
          @open="openPhoto(corner)"
          @file="(f) => addPhoto('corner', f)"
          @remove="removePhoto(corner)"
        />
        <div v-else class="text-caption text-grey-6">{{ $t('unitPage.noCorner') }}</div>
      </section>

      <!-- Δράσεις -->
      <section class="q-mb-lg">
        <div class="tf-card-head">
          <q-icon name="photo_library" />{{ $t('unitPage.activities') }}
          <span v-if="editing" class="text-caption text-grey-7 q-ml-sm">{{ activities.length }}/{{ MAX_ACTIVITIES }}</span>
        </div>
        <div v-if="activities.length || editing" class="activity-grid">
          <PhotoTile
            v-for="photo in activities"
            :key="photo.id"
            :src="url(photo.path)"
            :editing="editing"
            :busy="busy === photo.id"
            @open="openPhoto(photo)"
            @remove="removePhoto(photo)"
          />
          <PhotoTile
            v-if="editing && activities.length < MAX_ACTIVITIES"
            editing
            :busy="busy === 'activity'"
            @file="(f) => addPhoto('activity', f)"
          />
        </div>
        <div v-else class="text-caption text-grey-6">{{ $t('unitPage.noActivities') }}</div>
      </section>

      <!-- Μέλη -->
      <div class="tf-card-head"><q-icon name="groups" />{{ $t('unitPage.members') }}</div>
      <div v-if="unit.users?.length" class="tf-card-grid" style="--tf-min: 240px">
        <q-card
          v-for="member in unit.users"
          :key="member.id"
          flat
          bordered
          class="cursor-pointer"
          @click="$router.push(`/user/${member.id}`)"
        >
          <q-card-section class="row items-center no-wrap q-gutter-sm">
            <div class="member-avatar">
              <AvatarDisplay :config="member.avatarConfig" size="48px" />
            </div>
            <div class="col">
              <div class="text-weight-bold ellipsis">{{ member.username }}</div>
              <div class="text-caption text-grey-7">{{ memberRole(member) }}</div>
            </div>
            <q-icon name="chevron_right" color="grey-6" />
          </q-card-section>
        </q-card>
      </div>
      <div v-else class="text-caption text-grey-6 q-pa-md">{{ $t('unitPage.noMembers') }}</div>

      <PhotoLightbox v-model="lightbox" :photos="galleryUrls" />
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useUnitStore } from '@/stores/unit';
import { useAuthStore } from '@/stores/auth';
import { config } from '@/config';
import AvatarDisplay from '@/components/AvatarDisplay.vue';
import PhotoTile from '@/components/unit/PhotoTile.vue';
import PhotoLightbox from '@/components/unit/PhotoLightbox.vue';

const MAX_ACTIVITIES = 9;

const route = useRoute();
const { t } = useI18n();
const $q = useQuasar();
const unitStore = useUnitStore();
const authStore = useAuthStore();

const unit = computed(() => unitStore.currentUnit);
const loading = computed(() => unitStore.loading && !unitStore.currentUnit);

const url = (path) => (path?.startsWith('http') ? path : `${config.apiUrl}${path}`);

// Ίδιος κανόνας με το backend (units/unit-access.ts)
const canEdit = computed(() => {
  const user = authStore.user;
  if (!user || !unit.value) return false;
  if (authStore.isSuperAdmin) return true;
  if (user.role === 'admin') return user.location?.id === unit.value.location?.id;
  return user.unit?.id === unit.value.id && user.unitRole === 'leader';
});

const editing = ref(false);
const busy = ref(null); // 'flag' | 'yell' | 'corner' | 'activity' | photo id
const yell = ref('');
const flagInput = ref(null);
const lightbox = ref(null);

const photos = computed(() => unit.value?.photos || []);
const corner = computed(() => photos.value.find((p) => p.kind === 'corner') || null);
const activities = computed(() => photos.value.filter((p) => p.kind === 'activity'));
// η γωνιά πρώτη, μετά οι δράσεις: η ίδια σειρά με τη σελίδα
const gallery = computed(() => [corner.value, ...activities.value].filter(Boolean));
const galleryUrls = computed(() => gallery.value.map((p) => url(p.path)));

const openPhoto = (photo) => {
  lightbox.value = gallery.value.findIndex((p) => p.id === photo.id);
};

const toggleEditing = () => {
  editing.value = !editing.value;
  yell.value = unit.value.description || '';
};

const notifyError = () => $q.notify({ color: 'negative', icon: 'report_problem', message: unitStore.error || t('unitPage.uploadError') });

const run = async (key, action) => {
  busy.value = key;
  try {
    const ok = await action();
    if (!ok) notifyError();
    return ok;
  } finally {
    busy.value = null;
  }
};

const addPhoto = (kind, file) => run(kind, () => unitStore.uploadUnitPhoto(unit.value.id, kind, file));

const removePhoto = (photo) => {
  $q.dialog({ message: t('unitPage.confirmRemove'), cancel: true, persistent: true }).onOk(() =>
    run(photo.id, () => unitStore.deleteUnitPhoto(unit.value.id, photo.id)));
};

const onFlag = (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (file) run('flag', () => unitStore.uploadUnitFlag(unit.value.id, file));
};

const saveYell = async () => {
  const ok = await run('yell', () => unitStore.updateUnit(unit.value.id, { description: yell.value }));
  if (ok) $q.notify({ color: 'positive', icon: 'check_circle', message: t('unitPage.saved') });
};

const memberRole = (member) => {
  if (member.unitRole === 'leader') return t('adminUsers.roles.leader');
  if (member.unitRole === 'deputy_leader') return t('adminUsers.roles.deputyLeader');
  return member.role === 'admin' ? t('unitPage.roles.captain') : t('unitPage.roles.guide');
};

watch(() => route.params.id, (id) => {
  editing.value = false;
  if (id) unitStore.fetchUnit(id);
}, { immediate: true });
</script>

<style scoped>
.unit-flag {
  position: relative;
  flex: 0 0 auto;
  width: 88px;
  height: 88px;
  border-radius: var(--radius-card);
  overflow: visible;
  display: grid;
  place-items: center;
  color: var(--klados-ink);
  background: color-mix(in srgb, var(--klados-color) 12%, var(--surface));
  border: 1px solid var(--border-soft);
}
.unit-flag img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}
.unit-flag__edit {
  position: absolute;
  right: -8px;
  bottom: -8px;
}
.yell {
  white-space: pre-line;
  font-style: italic;
}
.corner-tile {
  max-width: 720px;
}
.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
@media (max-width: 599px) {
  .activity-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.member-avatar {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--klados-color) 10%, var(--surface));
}
.page-title {
  margin: 0 0 4px;
}
</style>
```

Σημείωση: το `updateUnit` και το `uploadUnitFlag` του store επιστρέφουν το unit **χωρίς** να ξαναφέρνουν τις φωτογραφίες, αν το `PATCH` δεν τις φορτώνει. Αφού το `findOne` του Task 4 φορτώνει πάντα `photos` και τα `update`/`updateFlag` επιστρέφουν `findOne`, το `currentUnit.photos` μένει σωστό. Επιβεβαίωσέ το στο Step 7.

- [ ] **Step 5: `frontend/src/pages/MyUnitPage.vue`** (ολόκληρο)

```vue
<template>
  <!-- «Η Ενωμοτία μου»: η κοινή σελίδα ενωμοτίας για την ενωμοτία του χρήστη -->
  <q-page class="tf-page">
    <PageHeader icon="groups" :title="$t('myUnit.title')" />
    <div class="row justify-center q-pa-xl">
      <div class="text-h6 text-grey">{{ $t('myUnit.notFound') }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import PageHeader from '@/components/PageHeader.vue';

const router = useRouter();
const authStore = useAuthStore();

watchEffect(() => {
  const unitId = authStore.user?.unit?.id;
  if (unitId) router.replace(`/units/${unitId}`);
});
</script>
```

Έλεγξε στο `frontend/src/router/routes.js` ότι το `units/:id` δεν απαιτεί ρόλο admin. Αν έχει `meta.requiresAdmin` (ή κάτι αντίστοιχο), αφαίρεσέ το, ώστε η σελίδα να ανοίγει για όλους τους συνδεδεμένους, όπως ήδη ανοίγει από την «Κοινότητα».

- [ ] **Step 6: Build.** `docker compose up -d --build frontend backend` και περίμενε healthy.

- [ ] **Step 7: Χειροκίνητος έλεγχος στον browser (Chrome DevTools MCP).**
  1. Σύνδεση ως Ενωμοτάρχης (`katerina.nikolaou` / `Odigos2026`) και άνοιγμα του `/my-unit`. Αναμενόμενο: redirect στο `/units/<id>`, που εμφανίζεται όπως για τους άλλους, με κουμπί «Επεξεργασία».
  2. Πάτησε «Επεξεργασία» και ανέβασε φωτογραφία γωνιάς και 2 δράσεις (μια μεγάλη εικόνα από το `scratchpad`, π.χ. 4000×3000 JPEG φτιαγμένη με `python3 -c` και PIL, ή με `sharp` μέσα σε container). Στο Network, το αίτημα πρέπει να είναι `image/webp` και κάτω από ~500KB.
  3. Αναμενόμενο: οι φωτογραφίες εμφανίζονται και ο μετρητής δείχνει «2/9». Πάτημα σε φωτογραφία → lightbox με εναλλαγή.
  4. Αλλαγή κραυγής → «Αποθηκεύτηκε» και το κείμενο μένει μετά από reload.
  5. Σύνδεση ως μέλος της ίδιας ενωμοτίας. Αναμενόμενο: βλέπει τις φωτογραφίες και δεν έχει κουμπί «Επεξεργασία».
  6. Στα 390px (κινητό): οι δράσεις σε 2 στήλες και τίποτα δεν βγαίνει έξω από την οθόνη.
  7. `docker compose exec -T garage /garage bucket info koryfes`: αναμενόμενο ότι ο αριθμός αντικειμένων αυξήθηκε.

- [ ] **Step 8: Commit**

```bash
git add frontend/src
git commit -m "feat(frontend): unit page with corner and activity gallery and in-place editing"
```

---

### Task 7: Επαλήθευση από την αρχή και τεκμηρίωση

**Files:**
- Modify: `devops/DEPLOYMENT.md` (αν χρειαστεί μετά τον έλεγχο), `README.md` (μία γραμμή για το Garage στο stack)

- [ ] **Step 1: Μεταφορά παλιού αρχείου σε πραγματικό stack.** Βάλε μια εικόνα στο `backend/uploads/unit-flags/legacy-test.png` και κάνε `docker compose restart backend`. Μετά:

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:3000/uploads/unit-flags/legacy-test.png
```

Αναμενόμενο: `200 image/png`, και στο log του backend «Copied 1 legacy upload(s)». Σβήσε μετά το δοκιμαστικό αρχείο από το `backend/uploads` και από το bucket (`docker compose exec -T garage /garage ...` ή μέσω του `DELETE` μιας φωτογραφίας).

- [ ] **Step 2: Όλα τα e2e.** Εντολή e2e με κενό pattern. Αναμενόμενο: όλα PASS.

- [ ] **Step 3: Prod config.** Οι δύο εντολές `docker compose -f docker-compose.prod.yml config` του Task 1, Step 7, με τα ίδια αναμενόμενα.

- [ ] **Step 4: README.** Στην ενότητα του stack πρόσθεσε: «`garage`: S3 (Garage) για τα ανεβασμένα αρχεία· το `garage-init` στήνει bucket και κλειδί στην πρώτη εκκίνηση».

- [ ] **Step 5: Commit**

```bash
git add README.md devops/DEPLOYMENT.md
git commit -m "docs: Garage storage in the stack"
```
