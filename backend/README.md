# Scout Badges - Backend

The RESTful API for Scout Badges, built with **NestJS**.

## ✨ Key Features

### 🔐 Authentication & Security
-   **JWT Authentication:** Secure stateless authentication using JSON Web Tokens.
-   **Role-Based Access Control (RBAC):** Guards to protect endpoints based on user roles (Admin, Leader, Scout).
-   **Password Hashing:** Secure password storage using `bcrypt`.
-   **Helmet:** Security headers for HTTP protection.
-   **Rate Limiting:** Protection against brute-force attacks.

### 💾 Data Management
-   **Database:** PostgreSQL for robust relational data storage.
-   **ORM:** TypeORM for type-safe database interactions.
-   **File Uploads:** Handling of profile pictures and badge images with local storage (extensible to S3).

### 🚀 API Capabilities
-   **Users:** CRUD operations, profile management, progress tracking.
-   **Badges:** Badge creation, assignment, and retrieval.
-   **Units:** Management of scout units and membership.
-   **Progress:** Logic for calculating and awarding path completions and diplomas.

## 🛠️ Tech Stack

-   **Framework:** [NestJS](https://nestjs.com/)
-   **Language:** TypeScript
-   **Database:** PostgreSQL
-   **ORM:** TypeORM
-   **Validation:** class-validator / class-transformer
-   **Documentation:** Swagger (optional integration)

## 🚀 Local Development

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Start development server**
    ```bash
    npm run start:dev
    ```

3.  **Run tests**
    ```bash
    npm run test
    ```

## 📂 Project Structure

-   `src/auth/`: Authentication logic and strategies
-   `src/users/`: User management module
-   `src/badges/`: Badge management module
-   `src/units/`: Unit management module
-   `src/progress/`: Progress calculation logic
-   `src/common/`: Shared decorators, guards, and filters
