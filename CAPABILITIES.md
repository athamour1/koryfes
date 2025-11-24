# Scout Badges - System Capabilities & User Roles

## User Roles & Permissions

### 1. Super Admin (System Administrator)
**Role:** `super_admin`

#### User Management
- ✅ Create users in any location
- ✅ View all users across all locations
- ✅ Update any user (including admins)
- ✅ Delete any user (except themselves)
- ✅ Assign/update user roles
- ✅ Upload user profile images
- ✅ Assign users to units

#### Unit Management
- ✅ Create units in any location
- ✅ View all units across all locations
- ✅ Update any unit
- ✅ Delete any unit
- ✅ Upload unit photos
- ✅ Assign unit leaders

#### Location Management
- ✅ Create new locations
- ✅ View all locations
- ✅ Update location details
- ✅ Delete locations
- ✅ Assign admins to locations

#### Badge Management (Legacy System)
- ✅ Create new badges
- ✅ View all badges
- ✅ Update badge details
- ✅ Delete badges
- ✅ Assign badges to users
- ✅ Remove badges from users
- ✅ Update badge acquisition dates

#### Progress System
- ✅ View all user progress
- ✅ Award peaks to any user (including Promise peak)
- ✅ Award paths to any user
- ✅ Award scout diplomas (levels 1-3)
- ✅ Award elective diplomas
- ✅ Remove progress items

#### Peaks Management
- ✅ Create peaks
- ✅ Update peak details
- ✅ Define peak requirements
- ✅ Set peak order

#### Paths Management
- ✅ Create paths
- ✅ Update path details
- ✅ Categorize paths

#### Diplomas Management
- ✅ Create scout diplomas (levels 1-3)
- ✅ Create elective diplomas
- ✅ Update diploma details

---

### 2. Admin (Local Guide Captain)
**Role:** `admin`  
**Scope:** Limited to assigned location only

#### User Management
- ✅ Create users (user role only, in their location)
- ✅ View users in their location
- ✅ Update users in their location (simple users only)
- ✅ Delete users in their location (simple users only)
- ✅ Upload profile images for users in their location
- ❌ Cannot modify other admins or super admins
- ❌ Cannot change user locations
- ❌ Cannot change user roles

#### Unit Management  
- ✅ View units in their location
- ✅ Create units in their location
- ✅ Update units in their location
- ✅ Delete units in their location
- ✅ Upload unit photos
- ❌ Cannot access units in other locations

#### Badge Management (Legacy System)
- ✅ View badges
- ✅ Assign badges to users in their location
- ✅ Update badge dates for users in their location
- ✅ Remove badges from users in their location
- ❌ Cannot create/update/delete badge definitions

#### Progress System
- ✅ View progress for users in their location
- ✅ Award peaks to users in their location
- ✅ Award paths to users in their location
- ✅ Award diplomas to users in their location
- ❌ Cannot modify progress for users in other locations

#### Dashboard
- ✅ View statistics for their location
- ✅ See top performers in their location
- ✅ View badge distribution charts

#### Locations
- ✅ View their assigned location details
- ❌ Cannot create/update/delete locations

---

### 3. Unit Leader
**Role:** `user` with `unitRole: 'leader'`

#### Unit Management
- ✅ View their unit details
- ✅ Update their unit photo
- ✅ View unit members
- ❌ Cannot create/delete units
- ❌ Cannot modify other units

#### User Management
- ✅ View members of their unit
- ❌ Cannot create/update/delete users

---

### 4. User (Guide/Scout)
**Role:** `user`

#### Own Profile
- ✅ View own profile
- ✅ Update own profile (name, avatar)
- ✅ Upload own profile image (⚠️ this is old remove it)
- ✅ Customize avatar (using Beanheads editor)

#### Progress Tracking
- ✅ View own progress (peaks, paths, diplomas)
- ✅ See current peak status
- ✅ See completed paths count
- ✅ See earned diplomas
- ❌ Cannot award progress to themselves

#### Community
- ✅ View other users (Scouts Community page)
- ✅ View other users' profiles
- ✅ View other users' progress
- ✅ View own unit information

#### Unit
- ✅ View own unit details
- ✅ View unit photo
- ❌ Cannot modify unit (unless unit leader)

---

## Backend Capabilities

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Location-based permissions for admins
- ✅ Password hashing with bcrypt
- ✅ Login/Register endpoints
- ✅ Forgot password functionality
- ✅ Reset password functionality

### Users Module
**Endpoints:**
- `GET /users` - List users (filtered by location for admins)
- `POST /users` - Create user
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/profile` - Get current user profile
- `PATCH /users/profile` - Update current user profile
- `POST /users/:id/badges` - Assign badge to user
- `PATCH /users/:id/badges/:badgeId` - Update badge date
- `DELETE /users/:id/badges/:badgeId` - Remove badge
- `POST /users/profile/image` - Upload own profile image
- `POST /users/:id/image` - Upload user profile image (admin)
- `GET /users/:id/progress` - Get user progress
- `POST /users/:id/progress/peak` - Award peak to user
- `POST /users/:id/progress/path` - Award path to user
- `POST /users/:id/progress/diploma` - Award diploma to user

**Features:**
- User search by name
- Filter by location
- Profile image uploads
- Avatar customization (Beanheads)
- Soft delete support
- Unit role management

### Units Module
**Endpoints:**
- `GET /units` - List units (filtered by location for admins)
- `POST /units` - Create unit
- `GET /units/:id` - Get unit details
- `PATCH /units/:id` - Update unit
- `DELETE /units/:id` - Delete unit
- `POST /units/:id/photo` - Upload unit photo

**Features:**
- Location-based filtering
- Photo uploads
- Leader assignment
- Member listing

### Locations Module
**Endpoints:**
- `GET /locations` - List all locations
- `POST /locations` - Create location (super admin)
- `GET /locations/:id` - Get location details
- `PATCH /locations/:id` - Update location (super admin)
- `DELETE /locations/:id` - Delete location (super admin)

**Features:**
- Hierarchical location structure
- Admin assignment

### Badges Module (Legacy System)
**Endpoints:**
- `GET /badges` - List all badges
- `POST /badges` - Create badge (super admin)
- `GET /badges/:id` - Get badge details
- `PATCH /badges/:id` - Update badge (super admin)
- `DELETE /badges/:id` - Delete badge (super admin)

**Features:**
- Badge categories
- Badge images
- Badge descriptions
- User-badge relationships

### User Progress Module (New System)
**Endpoints:**
- `GET /user-progress/me` - Get current user's progress
- `POST /user-progress/initialize` - Initialize progress for current user
- `POST /user-progress/award-peak` - Award peak (admin)
- `POST /user-progress/award-path` - Award path (admin)
- `POST /user-progress/award-diploma` - Award diploma (admin)
- `GET /user-progress` - Get all progress (admin)

**Features:**
- Automatic peak progression based on achievements
- Peak requirements validation
- Path tracking
- Scout diploma progression (levels 1-3)
- Elective diploma tracking

### Peaks Module
**Endpoints:**
- `GET /peaks` - List all peaks
- `POST /peaks` - Create peak (super admin)
- `GET /peaks/:id` - Get peak details
- `PATCH /peaks/:id` - Update peak (super admin)
- `DELETE /peaks/:id` - Delete peak (super admin)

**Features:**
- Peak ordering system
- Peak requirements definition
- Peak images
- Automatic unlocking logic

**Default Peaks:**
1. **Promise** (Order 1) - Manually awarded, unlocks progress system
2. **Bronze** (Order 2) - Auto-unlocked: 4 paths + 1st scout diploma + 1 elective
3. **Silver** (Order 3) - Auto-unlocked: 8 paths + 2nd scout diploma + 2 electives
4. **Gold** (Order 4) - Auto-unlocked: 12 paths + 3rd scout diploma + 4 electives

### Paths Module
**Endpoints:**
- `GET /paths` - List all paths
- `POST /paths` - Create path (super admin)
- `GET /paths/:id` - Get path details
- `PATCH /paths/:id` - Update path (super admin)
- `DELETE /paths/:id` - Delete path (super admin)

**Features:**
- Path categories
- Path descriptions
- Completion tracking

### Scout Diplomas Module
**Endpoints:**
- `GET /scout-diplomas` - List scout diplomas
- `POST /scout-diplomas` - Create scout diploma (super admin)
- `GET /scout-diplomas/:id` - Get diploma details
- `PATCH /scout-diplomas/:id` - Update diploma (super admin)
- `DELETE /scout-diplomas/:id` - Delete diploma (super admin)

**Features:**
- Level-based diplomas (1, 2, 3)
- Diploma progression tracking
- Requirement validation

### Elective Diplomas Module
**Endpoints:**
- `GET /elective-diplomas` - List elective diplomas
- `POST /elective-diplomas` - Create elective diploma (super admin)
- `GET /elective-diplomas/:id` - Get diploma details
- `PATCH /elective-diplomas/:id` - Update diploma (super admin)
- `DELETE /elective-diplomas/:id` - Delete diploma (super admin)

**Features:**
- Multiple elective options
- Independent completion tracking
- Flexible elective system

### Admin Module
**Endpoints:**
- `GET /admin/stats` - Get system statistics

**Features:**
- Total users count
- Total badges count
- Total awarded badges count
- Top users by badges
- Badge distribution analytics

---

## Database Entities

### Core Entities
- **User** - User accounts with authentication
- **UserBadge** - Many-to-many relationship (User ↔ Badge)
- **Unit** - Scout units/groups
- **Location** - Geographic locations/regions
- **Badge** - Badge definitions (legacy system)

### Progress System Entities
- **UserProgress** - User progress tracking
- **Peak** - Peak definitions
- **Path** - Path definitions
- **ScoutDiploma** - Scout diploma definitions
- **ElectiveDiploma** - Elective diploma definitions

### Entity Relationships
```
User ─┬─ many badges via UserBadge
      ├─ belongs to Location
      ├─ belongs to Unit
      └─ has one UserProgress
                  ├─ has current Peak
                  ├─ has many completed Paths
                  ├─ has many ScoutDiplomas
                  └─ has many ElectiveDiplomas
```

---

## File Upload Capabilities
- ✅ User profile images (JPG, PNG)
- ✅ Unit photos
- ✅ Automatic file naming (random hash)
- ✅ File storage in `/uploads/profile-images`
- ✅ Public file serving via nginx

---

## Security Features
- ✅ JWT authentication with expiry
- ✅ Password hashing (bcrypt)
- ✅ Role-based guards
- ✅ Location-based access control
- ✅ Self-deletion prevention
- ✅ Rate limiting (100 requests/minute)
- ✅ CORS configuration
- ✅ Environment variable configuration

---

## Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** JWT (Passport)
- **File Upload:** Multer
- **Validation:** class-validator
- **API:** REST

### Frontend (Original)
- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **UI Library:** Quasar
- **State:** Pinia
- **Routing:** Vue Router
- **i18n:** vue-i18n
- **HTTP:** Axios

### Frontend (Migrated - Quasar CLI)
- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **Build Tool:** Quasar CLI with Vite
- **UI Library:** Quasar
- **PWA:** Quasar PWA mode with Workbox
- **State:** Pinia
- **Routing:** Vue Router
- **i18n:** vue-i18n
- **HTTP:** Axios

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Web Server:** Nginx (frontend)
- **Database:** PostgreSQL 14

---

## Current System Status

### ✅ Fully Implemented
- User authentication & authorization
- Role-based access control
- Location-based permissions
- User management (CRUD)
- Unit management (CRUD)
- Location management (CRUD)
- Badge system (legacy - CRUD)
- Progress system (peaks, paths, diplomas)
- Automatic peak progression
- File uploads (profile images, unit photos)
- Admin dashboard with statistics
- Avatar customization (Beanheads)
- i18n support (Greek, English)
- Dark mode
- PWA capabilities (Quasar CLI version)

### 🔄 In Progress
- Quasar CLI PWA migration (95% complete)
- Mobile responsive optimizations

### 📋 Planned/TODO
- Push notifications
- Advanced reporting
- Export functionality
- Badge generation/printing
- Email notifications
- Advanced search/filtering
- Activity logging/audit trail

---

## API Documentation

All endpoints follow REST conventions and return JSON responses.

### Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

### Error Response Format
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Authentication
All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

**Last Updated:** 2025-11-24  
**Version:** 1.0
