# E2E Test Execution Guide

This guide explains how to run and maintain the End-to-End (E2E) tests for the Guide Badges application using Cypress.

## Prerequisites

Ensure the backend and database are running:
```bash
docker compose up -d
```

Ensure demo data is populated (tests rely on specific users):
```bash
./scripts/populate_demo_data.sh
```

## Running Tests

### Interactive Mode (Development)
Opens the Cypress Test Runner UI. Best for writing and debugging tests.

```bash
cd frontend
npm run test:e2e
```

### Headless Mode (CI/CD)
Runs all tests in the terminal. Best for verifying everything before pushing.

```bash
cd frontend
npm run test:e2e:ci
```

## Test Structure

Tests are located in `frontend/test/cypress/e2e/` and organized by user role:

- **auth/**: Login and authorization tests
- **superadmin/**: Global management (Users, Locations, Units, Progress)
- **admin/**: Location-scoped management
- **unit-leader/**: Unit management and member progress
- **user/**: Profile, Avatar, Progress, Community
- **integration/**: Cross-feature workflows (Data flow, Search, Uploads)

## Test Data

User credentials are defined in `frontend/test/cypress/fixtures/users.json`.
Common roles:
- **Super Admin**: `admin` / `admin123`
- **Location Admin**: `admin_1` / `test`
- **Unit Leader**: `αλέξανδρος_παπαδόπουλος_1_1_1` / `test`
- **Regular User**: `δημήτρης_καραμανλής_1_1_3` / `test`

## Custom Commands

Defined in `frontend/test/cypress/support/commands.js`:
- `cy.login(username, password)`
- `cy.loginAs(role)` (e.g., 'superAdmin', 'user')
- `cy.logout()`
- `cy.checkAuth()`

## Troubleshooting

- **Port Mismatch**: Ensure `cypress.config.cjs` `baseUrl` matches your running dev server (default `http://localhost:5173`).
- **Data Issues**: If tests fail due to missing data, re-run `./scripts/populate_demo_data.sh`.
- **Element Not Found**: Use `data-cy` attributes in your Vue components to make selectors robust.
  - Example: `<q-btn data-cy="save-btn" ... />`
