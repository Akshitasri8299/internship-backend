# ER Diagram — Internship & Recruitment Management System

## Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS {
        int id PK
        varchar name
        varchar email "UNIQUE"
        varchar password "hashed"
        enum role "candidate | recruiter | admin"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    INTERNSHIPS {
        int id PK
        int recruiter_id FK
        varchar title
        text description
        int stipend
        varchar location
        text_array skills_required
        date deadline
        enum status "open | closed | draft"
        timestamp created_at
        timestamp updated_at
    }

    APPLICATIONS {
        int id PK
        int internship_id FK
        int candidate_id FK
        varchar resume_url
        enum status "Applied | Shortlisted | Interview Scheduled | Rejected | Selected"
        timestamp applied_at
        timestamp updated_at
    }

    USERS ||--o{ INTERNSHIPS : "recruiter posts"
    USERS ||--o{ APPLICATIONS : "candidate applies"
    INTERNSHIPS ||--o{ APPLICATIONS : "receives"
```

## Relationships

1. **USERS → INTERNSHIPS** (One-to-Many)
   - A user with role `recruiter` (or `admin`) can create many internships.
   - `internships.recruiter_id` references `users.id`.
   - On recruiter deletion, their internships are cascade-deleted.

2. **USERS → APPLICATIONS** (One-to-Many)
   - A user with role `candidate` can submit many applications.
   - `applications.candidate_id` references `users.id`.

3. **INTERNSHIPS → APPLICATIONS** (One-to-Many)
   - An internship can receive many applications.
   - `applications.internship_id` references `internships.id`.
   - A `UNIQUE(internship_id, candidate_id)` constraint prevents duplicate applications.

## Notes

- `skills_required` is stored as a PostgreSQL `text[]` array with a GIN index for fast filtering (`GET /internships?skills=nodejs,react`).
- `role`, `status` (internship), and `status` (application) are implemented as PostgreSQL `ENUM` types for data integrity.
- `created_at` / `updated_at` columns are auto-managed via triggers.
