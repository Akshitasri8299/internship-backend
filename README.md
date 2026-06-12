# Internship & Recruitment Management Backend System

A REST API backend that allows **candidates** to apply for internships, **recruiters** to manage internship listings and applications, and **admins** to oversee users and reports.

Built with **Node.js, Express, PostgreSQL, JWT authentication**, and documented with **Swagger/OpenAPI**.

---

## Features

- **Authentication & Authorization**: Registration, login, JWT-based auth, bcrypt password hashing, Role-Based Access Control (Candidate / Recruiter / Admin).
- **Internship Management**: Recruiters can create, update, delete internships and view applicants.
- **Candidate Applications**: Browse internships, apply with a resume URL, track application status.
- **Dashboards**: Recruiter and Admin statistics APIs.
- **Search, Filter, Sort, Pagination** on internship listings.
- **Structured error responses**, request logging (Morgan), validation middleware (express-validator).
- **API Documentation** via Swagger UI.
- **Rate limiting** (100 requests/minute, configurable).
- **Docker & docker-compose** for one-command setup.

---

## Tech Stack

| Layer          | Technology              |
|----------------|--------------------------|
| Runtime        | Node.js 18+              |
| Framework      | Express.js               |
| Database       | PostgreSQL               |
| Auth           | JWT + bcryptjs            |
| Validation     | express-validator         |
| Docs           | swagger-jsdoc + swagger-ui-express |
| Security       | helmet, cors, express-rate-limit |
| Containerization | Docker + docker-compose |

---

## Project Structure

```
internship-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection pool
│   │   ├── schema.sql         # Database schema (DDL)
│   │   ├── migrate.js         # Migration runner
│   │   └── swagger.js         # Swagger/OpenAPI config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── internshipController.js
│   │   ├── applicationController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── rbac.js             # Role-based access control
│   │   ├── validate.js        # express-validator error formatter
│   │   ├── errorHandler.js     # Global error handler + 404
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── internshipModel.js
│   │   └── applicationModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── internshipRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── asyncHandler.js
│   │   └── ApiError.js
│   ├── app.js                  # Express app setup
│   └── server.js               # Entry point
├── Dockerfile
├── docker-compose.yml
├── ER_DIAGRAM.md
├── ARCHITECTURE.md
├── Internship_Recruitment_API.postman_collection.json
├── .env.example
└── package.json
```

---

## Getting Started

### 1. Local Setup (without Docker)

**Prerequisites**: Node.js 18+, PostgreSQL 13+

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your PostgreSQL connection string and JWT secret

# Run database migration (creates tables)
npm run migrate

# Start the server (development with auto-reload)
npm run dev

# Or start in production mode
npm start
```

The server runs at `http://localhost:5000` by default.
Swagger docs: `http://localhost:5000/api-docs`

### 2. Run with Docker (recommended)

```bash
docker-compose up
```

This will:
- Start a PostgreSQL container
- Run migrations automatically
- Start the API on `http://localhost:5000`

---

## Environment Variables

See `.env.example`:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for signing JWTs | long random string |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user (candidate/recruiter/admin) |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/profile` | Authenticated | Get current user's profile |

### Internships
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/internships` | Recruiter, Admin | Create internship |
| GET | `/internships` | Public | List internships (search/filter/sort/paginate) |
| GET | `/internships/:id` | Public | Get internship by ID |
| PUT | `/internships/:id` | Recruiter (owner), Admin | Update internship |
| DELETE | `/internships/:id` | Recruiter (owner), Admin | Delete internship |
| GET | `/internships/:id/applicants` | Recruiter (owner), Admin | List applicants |
| POST | `/internships/:id/apply` | Candidate | Apply to internship |

### Applications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/applications/me` | Candidate | Get my applications |
| PUT | `/applications/:id/status` | Recruiter (owner), Admin | Update application status |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard/recruiter` | Recruiter, Admin | Total internships, applicants, shortlisted |
| GET | `/dashboard/admin` | Admin | Total users, internships, active recruiters |

---

## Query Parameters for `GET /internships`

```
GET /internships?location=remote&skills=nodejs,react&status=open&search=backend&page=1&limit=10&sortBy=created_at&order=desc
```

- `location` — partial match (case-insensitive)
- `skills` — comma-separated, matches if internship requires **any** of the listed skills
- `status` — `open` | `closed` | `draft`
- `search` — searches title and description
- `page`, `limit` — pagination
- `sortBy` — `created_at` | `deadline` | `stipend` | `title`
- `order` — `asc` | `desc`

---

## Error Response Format

```json
{
  "success": false,
  "message": "Invalid email format",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Application Status Flow

```
Applied → Shortlisted → Interview Scheduled → Selected
                     ↘ Rejected
```

---

## Postman Collection

Import `Internship_Recruitment_API.postman_collection.json` into Postman. Set the `baseUrl` variable (default `http://localhost:5000/api`) and populate token variables after logging in.

---

## Deployment

This project can be deployed to Render, Railway, AWS, or DigitalOcean:

1. Push code to a GitHub repository.
2. Create a PostgreSQL instance (e.g., Render PostgreSQL, Railway PostgreSQL, AWS RDS).
3. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.) on the hosting platform.
4. Run `npm run migrate` once to create tables (or let it run via the deploy/start command).
5. Set the start command to `npm start`.
6. After deployment, update the Postman collection's `baseUrl` and Swagger `servers` config with the live URL.

---

## Future Improvements

- Resume parsing (extract name/skills/experience from PDF resumes)
- Email notifications on application status changes
- Redis caching for `/internships` and `/dashboard` endpoints
- Refresh tokens and token revocation
- Automated test suite (Jest + Supertest)
