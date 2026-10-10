# Korifes Application

A full-stack badge management system built with **NestJS**, **Vue 3**, **Quasar**, and **PostgreSQL**.

## 🚀 Quick Start

### Using Docker (Recommended)

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd seo-test-app
    ```

2.  **Configure environment**
    ```bash
    cp .env.example .env
    # set JWT_SECRET, DB_PASSWORD and ADMIN_PASSWORD
    ```

3.  **Start the application**
    ```bash
    docker compose up --build
    ```

4.  **Access the application**
    -   **Frontend:** [http://localhost:8080](http://localhost:8080)
    -   **Backend API:** [http://localhost:3000](http://localhost:3000)

### Release & Production
`./release.sh` builds and pushes the `backend` / `frontend` images to
`ghcr.io/athamour1/seo-test-app/*` and creates a tagged GitHub release; the server
runs them with `docker-compose.prod.yml` + `.env.production`. See the
[**Deployment Guide**](./devops/DEPLOYMENT.md).

### Admin Account
On startup the backend creates (or resets) a super admin from `ADMIN_USERNAME` /
`ADMIN_PASSWORD`. There is no public sign-up; admins create all other users.

### Requirements
-   Node.js 24+ for local development (Docker images use `node:24-alpine`)

### Database Migrations
The Postgres schema is managed by TypeORM migrations in `backend/src/migrations`,
applied automatically on backend startup. After changing an entity:

```bash
cd backend
npm run migration:generate -- src/migrations/DescribeYourChange
```

Local development with `DB_TYPE=sqlite` still auto-syncs the schema from the entities.

---

## ✨ Features Overview

-   **User Management:** Complete authentication system with role-based access (Guides, Leaders, Admins).
-   **Badge System:** Dynamic badge creation, assignment, and progress tracking.
-   **Avatar Editor:** Custom avatar creator with extensive customization options.
-   **Admin Dashboard:** Powerful tools for managing users, units, and badges.
-   **Internationalization:** Full Greek language support.

## 📚 Documentation

For detailed information about the specific technologies and features, please refer to the respective directories:

-   [**Frontend Documentation**](./frontend/README.md) - Vue 3, Quasar, Avatar Editor, and more.
-   [**Backend Documentation**](./backend/README.md) - NestJS API, Database Schema, and Security.

## 🛠️ Tech Stack

| Frontend | Backend | Infrastructure |
|----------|---------|----------------|
| Vue 3 | NestJS | Docker |
| Quasar | PostgreSQL | Nginx |
| Pinia | TypeORM | GHCR |
| Vite | Passport/JWT | |

## ⚙️ Runtime Configuration

The frontend uses a **runtime configuration** approach to allow environment variables to be changed via `docker-compose.yml` **without rebuilding** the Docker image.

### How It Works

1. **`entrypoint.sh`**: Runs when the container starts and generates `/usr/share/nginx/html/config.js` with values from environment variables.
2. **`window.appConfig`**: The generated `config.js` file sets configuration values on the global `window` object.
3. **`src/config.js`**: Reads from `window.appConfig` first, then falls back to build-time `import.meta.env` values.

### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api` |
| `VITE_ENV` | Environment (development/production) | `production` |
| `VITE_STAGING_MESSAGE` | Optional staging banner message | _(empty)_ |

### Usage Example

Set variables in `docker-compose.yml`:

```yaml
frontend:
  environment:
    VITE_STAGING_MESSAGE: "Staging Environment - Test Only"
```

Then restart (no rebuild needed):
```bash
docker compose up
```

The staging message will appear on the login page.

---

## 📄 License

MIT
