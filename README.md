# Guide Badges Application

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

## 📄 License

MIT
