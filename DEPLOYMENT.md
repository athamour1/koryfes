# Production Deployment Guide

## Deployment Architecture

This application supports two deployment architectures:

### **Option 1: Reverse Proxy (Recommended - Simpler)**

```
Internet → [Frontend Container with Nginx]
              ├─ Serves static files
              └─ Proxies /api/* → Backend Container
```

**Advantages:**
- Single domain/port exposure
- No CORS issues
- Simpler SSL/TLS setup (one certificate)
- Frontend nginx handles all routing

**Configuration:**
- `VITE_API_URL=/api` (or leave empty)
- Only expose frontend port (8080) to the internet
- Backend communicates internally via Docker network

### **Option 2: Separate Subdomains**

```
Internet → [Frontend Container] (yourdomain.com)
Internet → [Backend Container] (api.yourdomain.com)
```

**Advantages:**
- Independent scaling of frontend/backend
- Can use different servers/infrastructure

**Disadvantages:**
- Requires two domains/subdomains
- Need to configure CORS properly
- Two SSL certificates needed
- The nginx reverse proxy in frontend becomes unused

**Configuration:**
- `VITE_API_URL=https://api.yourdomain.com`
- Expose both frontend (8080) and backend (3000) ports
- Configure backend `CORS_ORIGIN=https://yourdomain.com`

---

## Runtime Configuration

The frontend application supports **runtime configuration** without requiring image rebuilds. This allows IT staff to modify critical settings by simply updating environment variables and restarting containers.

### Configurable Variables

| Variable | Description | Example (Reverse Proxy) | Example (Separate Subdomain) |
|----------|-------------|------------------------|------------------------------|
| `VITE_API_URL` | Backend API endpoint URL | `/api` | `https://api.yourdomain.com` |
| `VITE_ENV` | Environment name | `production` | `production` |
| `VITE_STAGING_MESSAGE` | Optional staging warning | _(empty)_ | `⚠️ Staging Environment` |

### How It Works

1. The `entrypoint.sh` script generates a `config.js` file at container startup
2. This file is loaded before the application starts
3. The application reads configuration from this file, falling back to build-time values if not set

### Deployment Steps

1. **Copy the example environment file:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Edit `.env.production` with your production values:**
   ```bash
   nano .env.production
   ```

3. **Start the services:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

4. **To change configuration later:**
   - Edit `.env.production`
   - Restart only the frontend: `docker compose -f docker-compose.prod.yml restart frontend`
   - Or restart all services: `docker compose -f docker-compose.prod.yml restart`

### Security Notes

- **Never commit `.env.production`** to version control (it's in `.gitignore`)
- Change all default passwords before deploying to production
- Use a strong, random `JWT_SECRET` (at least 32 characters)
- Ensure `CORS_ORIGIN` matches your actual frontend domain

### Example Production Configuration (Reverse Proxy - Recommended)

```env
# Frontend (uses nginx reverse proxy)
VITE_API_URL=/api
VITE_ENV=production
VITE_STAGING_MESSAGE=

# Backend
JWT_SECRET=your-very-long-and-random-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
CORS_ORIGIN=https://scoutbadges.org

# Database
DB_PASSWORD=SecureDBPassword456!
```

In this setup, you only need to expose the frontend port (8080) to the internet. The nginx configuration in the frontend container will proxy all `/api/*` requests to the backend container internally.

### Example Staging Environment

For a staging environment, you might want to display a warning message:

```env
VITE_API_URL=/api
VITE_ENV=staging
VITE_STAGING_MESSAGE=⚠️ This is a staging environment - Data may be reset
```

This message will appear on the login page to warn users they're not on production.

### Example Separate Subdomain Configuration (Advanced)

If you need to deploy frontend and backend on separate infrastructure:

```env
# Frontend
VITE_API_URL=https://api.scoutbadges.org
VITE_ENV=production
VITE_STAGING_MESSAGE=

# Backend (must be accessible at api.scoutbadges.org)
CORS_ORIGIN=https://scoutbadges.org
```

**Note:** With this approach, you'll need to expose the backend port (3000) and configure your reverse proxy/load balancer to route `api.scoutbadges.org` to the backend container.
