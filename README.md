# blogger-api-with-jwt-auth

A RESTful API for a blogging platform built with Node.js, Express, and PostgreSQL. Features JWT authentication with refresh token rotation and role-based access control.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (access + refresh tokens), bcrypt
- **Logging:** Pino
- **Containerization:** Docker

## Features

- JWT authentication with refresh token rotation
- Role-based access control (Admin / NormalUser)
- Refresh tokens stored in DB and revocable
- Structured JSON logging with Pino
- Global error handling with Prisma error mapping

## API Endpoints

### Auth

| Method | Endpoint                       | Access  |
| ------ | ------------------------------ | ------- |
| POST   | `/api/v1/auth/register`        | Public  |
| POST   | `/api/v1/auth/login`           | Public  |
| POST   | `/api/v1/auth/logout`          | Private |
| POST   | `/api/v1/auth/refresh`         | Public  |
| GET    | `/api/v1/auth/me`              | Private |
| POST   | `/api/v1/auth/change-password` | Private |

### Users

| Method | Endpoint            | Access          |
| ------ | ------------------- | --------------- |
| GET    | `/api/v1/users`     | Private (Admin) |
| GET    | `/api/v1/users/:id` | Public          |
| PUT    | `/api/v1/users/:id` | Private         |
| DELETE | `/api/v1/users/:id` | Private         |

### Blogs

| Method | Endpoint            | Access  |
| ------ | ------------------- | ------- |
| GET    | `/api/v1/blogs`     | Public  |
| GET    | `/api/v1/blogs/:id` | Public  |
| POST   | `/api/v1/blogs`     | Private |
| PUT    | `/api/v1/blogs/:id` | Private |
| DELETE | `/api/v1/blogs/:id` | Private |

## Getting Started

```bash
# Start the database
docker-compose up -d

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start the server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydb

JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

REDIS_URL=redis://localhost:6379
```

## Health Check

```
GET /health
```

## Roadmap

- [ ] Input validation with **Zod**
- [ ] Rate limiting
- [ ] Redis cache-aside for blog endpoints
- [ ] Pagination for blogs and users
- [ ] Unit testing with **Jest**
- [ ] Integration testing with **Supertest**
- [ ] Multi-stage **Dockerfile** for production builds
- [ ] CI/CD pipeline with **GitHub Actions** (lint, test, build)
