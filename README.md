# Korifes Application

A full-stack badge management system built with **NestJS**, **Vue 3**, **Quasar**, and **PostgreSQL**.

## 🚀 Quick Start

### Using Docker (Recommended)

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd guide-badges
    ```

2.  **Start the application**
    ```bash
    docker compose up --build
    ```

3.  **Access the application**
    -   **Frontend:** [http://localhost:8080](http://localhost:8080)
    -   **Backend API:** [http://localhost:3000](http://localhost:3000)

### Default Admin Credentials
-   **Username:** `admin`
-   **Password:** `admin123`

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
| Pinia | TypeORM | GitHub Actions |
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
| `VITE_ENV` | Environment (development/production) | `development` |
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
