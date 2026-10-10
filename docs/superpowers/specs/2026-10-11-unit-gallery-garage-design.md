# Γκαλερί ενωμοτίας, συμπίεση εικόνων και Garage S3

Ημερομηνία: 2026-10-11 · Κατάσταση: εγκρίθηκε στη συζήτηση, προς αναθεώρηση

## Στόχος

1. Κάθε ενωμοτία έχει μικρή γκαλερί: **1 φωτογραφία της γωνιάς** της και **έως 9 φωτογραφίες δράσεων** (λιγότερες επιτρέπονται).
2. Υπάρχει **μία σελίδα ενωμοτίας για όλους**. Ο Ενωμοτάρχης τη βλέπει όπως οι άλλοι, με κουμπί «Επεξεργασία».
3. Οι φωτογραφίες **συμπιέζονται** ώστε να μην ανεβαίνουν megabytes και να μη φορτώνεται ο server.
4. Τα ανεβασμένα αρχεία φεύγουν από τον τοπικό δίσκο και μπαίνουν σε **Garage (S3)**, και στο dev και στο production.

## Τι υπάρχει σήμερα

- Μόνο οι σημαίες ενωμοτιών ανεβαίνουν, μέσω `POST /units/:id/image` με multer `diskStorage` στο `./uploads/unit-flags` (`backend/src/common/image-upload.ts`: εικόνες μόνο, ≤5MB, τυχαίο όνομα).
- Τα αρχεία σερβίρονται από το backend στο `/uploads/*` (`main.ts`, `app.module.ts`). Το frontend τα ζητά ως `${config.apiUrl}${path}`. Στο production, το nginx του frontend στέλνει το `/api` στο backend.
- Volumes: dev `./backend/uploads:/usr/src/app/uploads`, prod `./uploads:/usr/src/app/uploads`.
- Δικαίωμα αλλαγής ενωμοτίας (σημαία/κραυγή): super admin, Αρχηγός του ίδιου τοπικού (`admin`), Ενωμοτάρχης της ενωμοτίας (`user` με `unitRole = leader`).

## Σχεδιασμός

### 1. Garage στο stack

- Υπηρεσία `garage` (`dxflrs/garage:v2.4.1`), ένας κόμβος, `replication_factor = 1`, `db_engine = "sqlite"`. Δεν δημοσιεύει θύρες· το backend μιλά μαζί της μέσα στο δίκτυο του Docker (S3 στο 3900, admin στο 3903).
- Το `garage.toml` είναι αρχείο στο repo (`garage/garage.toml`). Τα `rpc_secret` και `admin_token` περνάνε από env (`GARAGE_RPC_SECRET`, `GARAGE_ADMIN_TOKEN`).
- Volumes `garage_meta` και `garage_data`.
- Υπηρεσία `garage-init` (μικρό image με `curl` και `jq`, ή script σε Node). Τρέχει μία φορά, μετά το healthcheck του Garage, και μέσω του admin API v2:
  1. αν δεν υπάρχει layout, αναθέτει τον κόμβο (zone `dc1`) και εφαρμόζει το layout·
  2. φτιάχνει το bucket `S3_BUCKET` (προεπιλογή `koryfes`) αν λείπει·
  3. εισάγει το κλειδί `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` (ImportKey) αν λείπει·
  4. δίνει στο κλειδί read/write στο bucket.
  Είναι idempotent. Το backend εξαρτάται από αυτό με `service_completed_successfully`.
- Μορφή κλειδιών Garage: access key `GK` + 24 hex, secret 64 hex. Το README δείχνει πώς παράγονται (`openssl rand -hex`).
- **Dev** (`docker-compose.yml`): προεπιλεγμένες τιμές για όλα τα secrets, ώστε το `docker compose up` να δουλεύει χωρίς ρύθμιση.
- **Prod** (`docker-compose.prod.yml`): τα `GARAGE_RPC_SECRET`, `GARAGE_ADMIN_TOKEN`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` είναι υποχρεωτικά (`:?`). Ενημερώνονται τα `.env.example`, `.env.production.example` και το `devops/DEPLOYMENT.md`.

### 2. Αποθήκευση στο backend

- `StorageService` (`backend/src/storage/`) πάνω στο `@aws-sdk/client-s3`, με `forcePathStyle: true`, endpoint `S3_ENDPOINT` (π.χ. `http://garage:3900`), region `garage`:
  - `put(key, buffer, contentType)`, `delete(key)`, `get(key)` → stream, content-type, length·
  - `exists(key)` για τη μεταφορά των παλιών αρχείων.
- Τα multer uploads περνούν σε `memoryStorage` (το αρχείο μένει στη μνήμη, ≤5MB). Μετά τη συμπίεση γράφονται στο S3 με κλειδί π.χ. `unit-flags/<random>.webp`.
- Οι στήλες στη βάση κρατούν την ίδια μορφή διαδρομής `/uploads/<key>`, οπότε το frontend δεν αλλάζει.
- **Σερβίρισμα**: ο controller `GET /uploads/*` διαβάζει από το S3 και στέλνει το αρχείο με το σωστό `Content-Type` και `Cache-Control: public, max-age=31536000, immutable` (τα ονόματα είναι τυχαία και δεν ξαναγράφονται). 404 αν δεν υπάρχει. Αντικαθιστά τα `useStaticAssets` / `ServeStaticModule` για το `/uploads`.
- **Μεταφορά παλιών αρχείων**: στην εκκίνηση, αν υπάρχει ο φάκελος `uploads/`, κάθε αρχείο του που λείπει από το bucket ανεβαίνει με κλειδί ίση με τη σχετική του διαδρομή. Ο φάκελος δεν σβήνεται. Το volume μένει στο compose για μία έκδοση και αφαιρείται αργότερα.
- **Tests**: τα e2e αντικαθιστούν το `StorageService` με in-memory υλοποίηση, ώστε να μη χρειάζονται Garage.

### 3. Συμπίεση εικόνων

- **Frontend** (`frontend/src/utils/compressImage.js`): πριν από κάθε ανέβασμα, η εικόνα σχεδιάζεται σε canvas με τη μεγάλη πλευρά ≤1600px (≤800px για σημαίες) και εξάγεται σε WebP ποιότητας 0.8 (JPEG αν ο browser δεν υποστηρίζει WebP). Τα GIF στέλνονται όπως είναι.
- **Backend** (`sharp`): σε κάθε ανέβασμα κάνει `rotate()` (σύμφωνα με το EXIF), μετά resize `fit: inside` με τα ίδια όρια και χωρίς μεγέθυνση, και τέλος εξάγει WebP ποιότητας 80. Το `sharp` αφαιρεί τα metadata (EXIF/GPS) εξ ορισμού. Αρχεία που το `sharp` δεν μπορεί να διαβάσει απορρίπτονται με 400.
- Το όριο των 5MB μένει. Ο έλεγχος τύπου MIME μένει όπως είναι.

### 4. Γκαλερί ενωμοτίας

**Μοντέλο**: οντότητα `UnitPhoto` / πίνακας `unit_photo`:
`id`, `unitId` (FK, `ON DELETE CASCADE`), `kind` (`corner` | `activity`), `path`, `createdAt`. Η σειρά των δράσεων είναι κατά `createdAt`. Νέο migration για Postgres· το SQLite των tests γίνεται synchronize.

**API**:
- `GET /units/:id` → επιστρέφει επιπλέον `photos: UnitPhoto[]`.
- `POST /units/:id/photos?kind=corner|activity` (multipart `file`):
  - `corner`: αντικαθιστά την υπάρχουσα και σβήνει το παλιό αντικείμενο από το S3·
  - `activity`: 400 αν υπάρχουν ήδη 9.
- `DELETE /units/:id/photos/:photoId`: σβήνει τη γραμμή και το αντικείμενο. 404 αν η φωτογραφία ανήκει σε άλλη ενωμοτία.
- Δικαιώματα: ίδια με το ανέβασμα σημαίας. Ο έλεγχος μεταφέρεται σε κοινό helper `assertCanEditUnit(user, unit)` και τον χρησιμοποιούν η σημαία, το PATCH και οι φωτογραφίες.
- Όταν σβήνεται ενωμοτία, σβήνονται και τα αντικείμενά της από το S3.

**Frontend**:
- Το `UnitPage.vue` γίνεται η μία σελίδα ενωμοτίας:
  - κάρτα με σημαία, όνομα, τοπικό και «Κραυγή»·
  - «Η Γωνιά μας»: μία μεγάλη φωτογραφία, ή κενή κατάσταση·
  - «Δράσεις»: πλέγμα 3 στηλών (2 στο κινητό), με μετρητή «n/9»·
  - μέλη, όπως σήμερα·
  - πάτημα σε φωτογραφία → προβολή σε πλήρη οθόνη (`q-dialog` + `q-carousel`) με εναλλαγή μπρος-πίσω.
- Λειτουργία «Επεξεργασία» (κουμπί μόνο για όσους έχουν δικαίωμα), μέσα στην ίδια σελίδα:
  - η κραυγή γίνεται πεδίο κειμένου, με «Αποθήκευση» και «Ακύρωση»·
  - η σημαία, η γωνιά και κάθε δράση έχουν κουμπί αλλαγής/αφαίρεσης·
  - οι κενές θέσεις δράσεων εμφανίζουν κουτί «+».
  - Κάθε ανέβασμα συμπιέζεται πρώτα, δείχνει πρόοδο και αποθηκεύεται αμέσως.
- Το `/my-unit` κάνει redirect στο `/units/<unitId του χρήστη>`. Η κενή κατάσταση «δεν ανήκετε σε ενωμοτία» μένει. Η φόρμα του `MyUnitPage.vue` καταργείται.
- Αν το `GET /units/:id` απορρίπτει απλούς χρήστες άλλων τοπικών, αυτό μένει ως έχει. Η γκαλερί δεν αλλάζει τα δικαιώματα ανάγνωσης.
- Νέα κείμενα i18n (el/en): «Η Γωνιά μας», «Δράσεις», «Επεξεργασία», «Προσθήκη φωτογραφίας», «Αφαίρεση», μετρητής, σφάλματα ορίου/μεγέθους.

## Εκτός σχεδίου

Λεζάντες, αλλαγή σειράς με σύρσιμο, πολλαπλό ανέβασμα με μία επιλογή, μικρογραφίες (thumbnails) σε δεύτερο μέγεθος, δημόσιο bucket ή CDN.

## Έλεγχος

- e2e (backend, με in-memory storage):
  - όριο 9 δράσεων·
  - η γωνιά αντικαθίσταται και το παλιό αντικείμενο σβήνεται·
  - απλός Οδηγός και Ενωμοτάρχης άλλης ενωμοτίας παίρνουν 401·
  - Αρχηγός άλλου τοπικού παίρνει 401·
  - μια εικόνα 3000px με EXIF βγαίνει ≤1600px, σε WebP, χωρίς EXIF·
  - το `GET /uploads/<key>` σερβίρει το αρχείο με σωστό content type·
  - η διαγραφή ενωμοτίας σβήνει τα αντικείμενα.
- Όλα τα υπάρχοντα e2e περνούν.
- Χειροκίνητα με το πραγματικό stack:
  - το `docker compose up` από την αρχή φτιάχνει bucket και κλειδί·
  - το ανέβασμα από τον browser δουλεύει και το αρχείο εμφανίζεται·
  - μια παλιά σημαία στο `backend/uploads` μεταφέρεται·
  - το `docker compose -f docker-compose.prod.yml config` περνά με τα απαιτούμενα env.
