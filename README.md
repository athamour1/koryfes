# Scout Badges Application

A full-stack badge management system built with NestJS, Vue 3, Quasar, and PostgreSQL.

## Features

- **User Management**: Registration, authentication, and profile management
- **Badge System**: Create and assign badges to users
- **Admin Dashboard**: Manage users and badges with table views and inline editing
- **Image Upload**: Profile pictures and badge images
- **Responsive Design**: Modern UI with Quasar components
- **Production Ready**: Security headers, rate limiting, environment-based configuration

## Tech Stack

### Backend
- NestJS
- PostgreSQL
- TypeORM
- JWT Authentication
- Helmet (Security)
- Rate Limiting

### Frontend
- Vue 3
- Quasar Framework
- Pinia (State Management)
- Axios

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scout-badges
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

## Environment Configuration

### Development
The `.env` file contains development settings:
```env
NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

### Production
For production, update the `.env` file:
```env
NODE_ENV=production
VITE_API_URL=https://your-api-domain.com
VITE_ENV=production
JWT_SECRET=your-strong-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

**Production Features:**
- Stricter password validation (8+ chars, uppercase, lowercase, number)
- Security headers via Helmet
- Rate limiting (100 requests/minute)
- CORS configuration

## Local Development

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
scout-badges/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # Users module
│   │   ├── badges/        # Badges module
│   │   └── main.ts        # Application entry
│   └── uploads/           # Uploaded files
├── frontend/
│   ├── src/
│   │   ├── pages/         # Vue pages
│   │   ├── stores/        # Pinia stores
│   │   ├── api.js         # API configuration
│   │   └── config.js      # Environment config
│   └── public/
└── docker-compose.yml
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current user profile

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user (admin only)
- `POST /users/:id/badges` - Assign badge (admin only)
- `DELETE /users/:id/badges/:badgeId` - Remove badge (admin only)
- `POST /users/profile/image` - Upload profile image

### Badges
- `GET /badges` - List all badges
- `POST /badges` - Create badge (admin only)
- `PATCH /badges/:id` - Update badge (admin only)

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per minute
- **CORS**: Configurable origins
- **Password Hashing**: bcrypt
- **JWT**: Secure authentication
- **Environment-based Validation**: Stricter rules in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
