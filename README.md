# DevPulse – Internal Tech Issue & Feature Tracker

A collaborative backend platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** https://dev-pulse-re46.onrender.com

## Features

- User registration and login with JWT authentication
- Role-based access control (contributor & maintainer)
- Create, view, update, and delete issues
- Filter and sort issues by type and status
- Secure password hashing with bcrypt
- PostgreSQL database with raw SQL queries

## Tech Stack

| Technology          | Usage              |
| ------------------- | ------------------ |
| Node.js 20.x        | Runtime            |
| TypeScript          | Language           |
| Express.js          | Web framework      |
| PostgreSQL (NeonDB) | Database           |
| pg (native driver)  | Database client    |
| bcrypt              | Password hashing   |
| jsonwebtoken        | JWT authentication |

## Project Structure

```
devpulse/
├── src/
│   ├── config/
│   │   └── db.ts               # PostgreSQL pool connection
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   └── issues/
│   │       ├── issues.routes.ts
│   │       ├── issues.controller.ts
│   │       └── issues.service.ts
│   ├── middleware/
│   │   ├── authenticate.ts     # JWT verification
│   │   ├── authorize.ts        # Role-based guard
│   │   └── errorHandler.ts     # Global error handler
│   ├── utils/
│   │   ├── response.ts         # sendSuccess / sendError
│   │   └── AppError.ts         # Custom error class
│   ├── types/
│   │   ├── index.ts            # User, Issue, JwtPayload interfaces
│   │   └── express.d.ts        # Express Request type extension
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── .env.example
├── tsconfig.json
└── package.json
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/asefdx/Dev-pulse.git
cd Dev-pulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
DATABASE_URL=your_neondb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
```

### 4. Create database tables

Run these SQL queries in your NeonDB dashboard:

```sql
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'contributor'
              CHECK (role IN ('contributor', 'maintainer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(150) NOT NULL,
  description  TEXT NOT NULL,
  type         VARCHAR(20) NOT NULL
               CHECK (type IN ('bug', 'feature_request')),
  status       VARCHAR(20) NOT NULL DEFAULT 'open'
               CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id  INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5. Run the development server

```bash
npm run dev
```

## API Endpoints

### Authentication

| Method | Endpoint           | Access | Description           |
| ------ | ------------------ | ------ | --------------------- |
| POST   | `/api/auth/signup` | Public | Register a new user   |
| POST   | `/api/auth/login`  | Public | Login and receive JWT |

### Issues

| Method | Endpoint          | Access          | Description                       |
| ------ | ----------------- | --------------- | --------------------------------- |
| GET    | `/api/issues`     | Public          | Get all issues (with filter/sort) |
| GET    | `/api/issues/:id` | Public          | Get a single issue                |
| POST   | `/api/issues`     | Authenticated   | Create a new issue                |
| PATCH  | `/api/issues/:id` | Authenticated   | Update an issue                   |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue                   |

### Query Parameters for GET /api/issues

| Parameter | Values                      | Default |
| --------- | --------------------------- | ------- |
| sort      | newest, oldest              | newest  |
| type      | bug, feature_request        | —       |
| status    | open, in_progress, resolved | —       |

## Database Schema

### users

| Field      | Type         | Description                |
| ---------- | ------------ | -------------------------- |
| id         | SERIAL       | Auto-increment primary key |
| name       | VARCHAR(255) | Full display name          |
| email      | VARCHAR(255) | Unique login email         |
| password   | VARCHAR(255) | Bcrypt hashed password     |
| role       | VARCHAR(20)  | contributor or maintainer  |
| created_at | TIMESTAMPTZ  | Auto-generated timestamp   |
| updated_at | TIMESTAMPTZ  | Auto-updated timestamp     |

### issues

| Field       | Type         | Description                 |
| ----------- | ------------ | --------------------------- |
| id          | SERIAL       | Auto-increment primary key  |
| title       | VARCHAR(150) | Issue headline              |
| description | TEXT         | Detailed explanation        |
| type        | VARCHAR(20)  | bug or feature_request      |
| status      | VARCHAR(20)  | open, in_progress, resolved |
| reporter_id | INTEGER      | References users.id         |
| created_at  | TIMESTAMPTZ  | Auto-generated timestamp    |
| updated_at  | TIMESTAMPTZ  | Auto-updated timestamp      |

## Deployment

- **Backend:** Render
- **Database:** NeonDB
- **Live URL:** https://dev-pulse-re46.onrender.com
