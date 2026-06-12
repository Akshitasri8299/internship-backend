# Architecture Document
## Internship & Recruitment Management Backend System

---

## 1. Folder Structure

The project follows a layered MVC-style architecture, separating concerns into distinct directories under `src/`:

```
src/
├── config/        # DB connection, schema, migrations, Swagger config
├── controllers/   # Request handlers — business logic per resource
├── middleware/    # Auth, RBAC, validation, error handling, rate limiting
├── models/        # Database query layer (raw SQL via pg)
├── routes/        # Express routers + Swagger/OpenAPI annotations
├── utils/         # Shared helpers (JWT, async wrapper, ApiError)
├── app.js         # Express app configuration (middleware, routes)
└── server.js      # Entry point — starts the HTTP server
```

**Rationale:**
- **Routes** define the HTTP surface and input validation rules only — no business logic.
- **Controllers** contain the request-handling logic, calling into models and throwing `ApiError` for failure cases.
- **Models** are the only layer that talks to PostgreSQL, using parameterized queries via the `pg` library to prevent SQL injection.
- **Middleware** is composable and reusable: `protect` (authentication), `authorize(...roles)` (RBAC), `validate` (input validation), and a centralized `errorHandler`.
- **Utils** hold small, dependency-free helpers used across layers (JWT signing/verification, async error wrapping, a custom `ApiError` class for structured errors).

This separation means a given resource (e.g., Internships) has a predictable path: `routes/internshipRoutes.js` → `controllers/internshipController.js` → `models/internshipModel.js`, making the codebase easy to navigate and extend.

---

## 2. Authentication Flow

### Registration (`POST /auth/register`)
1. Client submits `name`, `email`, `password`, optional `role`.
2. express-validator checks email format and password length (min 6 chars).
3. Controller checks if the email already exists (`409 Conflict` if so).
4. Password is hashed with **bcrypt** (10 salt rounds) — plaintext passwords are never stored.
5. User row is inserted with role defaulting to `candidate` if not a valid role.
6. A **JWT** is generated (`{ id, role }` payload, signed with `JWT_SECRET`, expires per `JWT_EXPIRES_IN`).
7. Response returns the created user (without password) and the token.

### Login (`POST /auth/login`)
1. Client submits `email` and `password`.
2. User is looked up by email; if not found or inactive, a generic `401`/`403` is returned (no information leakage about which field is wrong).
3. `bcrypt.compare` checks the password against the stored hash.
4. On success, a new JWT is issued.

### Authenticated Requests
1. Client sends `Authorization: Bearer <token>` header.
2. The `protect` middleware:
   - Extracts and verifies the JWT (`jsonwebtoken.verify`).
   - Re-fetches the user from the database by `id` in the token payload, ensuring the user still exists and `is_active = true` (so deactivated/deleted users are immediately locked out even with a valid, unexpired token).
   - Attaches `{ id, name, email, role, is_active }` to `req.user`.
3. The `authorize(...roles)` middleware (used after `protect`) checks `req.user.role` against an allow-list. A `403 Forbidden` is thrown if the role isn't permitted.

### Resource-Level Authorization
Beyond role checks, **ownership checks** are performed in controllers for recruiter-owned resources:
- Updating/deleting an internship, or viewing its applicants, requires `req.user.role === 'admin'` **or** `internship.recruiter_id === req.user.id`.
- Updating an application's status requires the same check against the parent internship's recruiter.

This two-layer model (role-based + ownership-based) ensures recruiters can only manage their own postings while admins have full access.

---

## 3. Database Design

PostgreSQL was chosen for its strong relational integrity guarantees, native `ENUM` types, and array/GIN indexing support (useful for `skills_required` filtering).

### Tables

**`users`**
- Stores all three roles (`candidate`, `recruiter`, `admin`) in a single table with a `role` enum column, rather than separate tables per role. This simplifies authentication (one lookup by email) and avoids duplicated auth logic, while RBAC middleware handles role-specific access at the application layer.
- `is_active` supports soft account deactivation without deleting data.

**`internships`**
- `recruiter_id` foreign key to `users.id` (cascade delete — if a recruiter account is removed, their listings go with it).
- `skills_required` is a `text[]` array with a **GIN index**, enabling efficient "any of these skills" filtering using the `&&` (overlap) operator.
- `status` enum (`open`, `closed`, `draft`) controls listing visibility and whether candidates can apply.
- Indexes on `location` and `status` support the most common filter combinations.

**`applications`**
- Foreign keys to both `internships.id` and `users.id` (candidate), with cascade delete.
- `UNIQUE(internship_id, candidate_id)` constraint enforces the business rule that a candidate cannot apply twice to the same internship — enforced at the database level, not just application logic.
- `status` enum models the application lifecycle: `Applied → Shortlisted → Interview Scheduled → Selected`, with `Rejected` as a terminal alternative branch.

### Triggers
All three tables have an `updated_at` column auto-maintained via a shared `trigger_set_timestamp()` PL/pgSQL trigger function, so controllers never need to manually set update timestamps.

### Why not MongoDB?
The data is inherently relational (users ↔ internships ↔ applications with strict referential integrity and uniqueness constraints), and PostgreSQL's enums, array+GIN indexing, and foreign key cascades map naturally onto these requirements while keeping query logic in SQL rather than application code.

---

## 4. Scalability Considerations

1. **Stateless authentication**: JWTs mean no server-side session store is required, so the API can be horizontally scaled behind a load balancer without session affinity.

2. **Pagination everywhere**: All list endpoints (`/internships`, `/applications/me`, `/internships/:id/applicants`) require `LIMIT`/`OFFSET`-based pagination, preventing unbounded result sets as data grows. `COUNT(*)` and data queries run as separate, indexed queries.

3. **Indexing strategy**: B-tree indexes on `location` and `status`, plus a GIN index on `skills_required`, keep the most common filter/search paths fast as the `internships` table grows. The `applications` table is indexed on `candidate_id`, `internship_id`, and `status` for dashboard aggregation queries.

4. **Connection pooling**: The `pg.Pool` reuses a configurable number of database connections rather than opening one per request, which is critical under concurrent load.

5. **Rate limiting**: `express-rate-limit` (100 req/min per IP by default) protects against abuse and accidental traffic spikes, configurable via environment variables.

6. **Caching (planned, Level 3 bonus)**: `GET /internships` and `GET /dashboard/*` are read-heavy and relatively cache-friendly. A Redis layer can sit in front of these with a short TTL (e.g., 30–60s) and cache invalidation triggered on internship create/update/delete, significantly reducing database load for the most frequently hit endpoints.

7. **Horizontal scaling via Docker**: The provided `docker-compose.yml` separates the API and database into independent containers. In production, multiple API container replicas can run behind a load balancer (e.g., on Render, Railway, or AWS ECS) while pointing to a single managed PostgreSQL instance (e.g., AWS RDS), with read replicas added later if read load becomes a bottleneck.

8. **Future decomposition**: If the system grows significantly, the current modular structure (separate controllers/models per domain) makes it straightforward to split into microservices (e.g., a separate Auth service, Internship service, and Application/Dashboard service) communicating over REST or a message queue, without rewriting business logic — only the routing/composition layer would change.
