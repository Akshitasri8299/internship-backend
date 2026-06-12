# 🚀 Internship & Recruitment Management Backend System

A production-ready REST API backend that enables **Candidates** to apply for internships, **Recruiters** to manage internship postings and applications, and **Admins** to oversee users and platform statistics.

Built using **Node.js, Express.js, PostgreSQL, JWT Authentication**, and documented with **Swagger/OpenAPI**.

---

## 🔗 Quick Links

| Resource             | Link                                                  |
| -------------------- | ----------------------------------------------------- |
| 📘 Swagger API Docs  | https://internship-backend-xlmv.onrender.com/api-docs |
| 🎥 Video Walkthrough | https://youtu.be/fcRUbUAw8J0                          |
| 📂 GitHub Repository | https://github.com/Akshitasri8299/internship-backend  |

---

## 📑 Table of Contents

* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [API Endpoints](#-api-endpoints)
* [Query Parameters](#-query-parameters)
* [Error Response Format](#-error-response-format)
* [Application Status Flow](#-application-status-flow)
* [Deployment](#-deployment)
* [Future Improvements](#-future-improvements)

---

# ✨ Features

### 🔐 Authentication & Authorization

* User Registration and Login
* JWT Authentication
* Password Hashing using bcryptjs
* Role-Based Access Control (Candidate, Recruiter, Admin)

### 📋 Internship Management

* Create internships
* Update internships
* Delete internships
* View applicants
* Ownership-based permissions

### 👨‍🎓 Candidate Applications

* Browse internships
* Apply using resume URL
* Track application status

### 📊 Dashboard APIs

#### Recruiter Dashboard

* Total internships
* Total applicants
* Shortlisted candidates

#### Admin Dashboard

* Total users
* Total internships
* Active recruiters

### 🔍 Search, Filter and Pagination

* Search by title and description
* Filter by location and skills
* Status filtering
* Pagination support
* Sorting support

### 🛡 Security Features

* Helmet
* CORS
* Rate Limiting
* Request Validation
* Global Error Handling

### 📚 API Documentation

* Swagger UI
* Postman Collection

---

# 🛠 Tech Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Runtime          | Node.js 18+                      |
| Framework        | Express.js                       |
| Database         | PostgreSQL                       |
| Authentication   | JWT + bcryptjs                   |
| Validation       | express-validator                |
| Documentation    | Swagger UI                       |
| Security         | Helmet, CORS, express-rate-limit |
| Logging          | Morgan                           |
| Containerization | Docker + Docker Compose          |

---

# 📂 Project Structure

```bash
internship-backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── Dockerfile
├── docker-compose.yml
├── ER_DIAGRAM.md
├── ARCHITECTURE.md
├── Internship_Recruitment_API.postman_collection.json
├── .env.example
└── package.json
```

---

# 🚀 Getting Started

## Prerequisites

* Node.js 18+
* PostgreSQL 13+

## Installation

Clone the repository:

```bash
git clone https://github.com/Akshitasri8299/internship-backend.git
cd internship-backend
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env
```

Run database migrations:

```bash
npm run migrate
```

Start development server:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server runs on:

```text
http://localhost:5000
```

Swagger Docs:

```text
http://localhost:5000/api-docs
```

---

# 🐳 Docker Setup

```bash
docker-compose up
```

This command will:

* Start PostgreSQL container
* Run database migrations
* Launch the API server

---

# ⚙ Environment Variables

| Variable             | Description                  |
| -------------------- | ---------------------------- |
| PORT                 | Server Port                  |
| DATABASE_URL         | PostgreSQL Connection String |
| JWT_SECRET           | Secret Key                   |
| JWT_EXPIRES_IN       | Token Expiry                 |
| RATE_LIMIT_WINDOW_MS | Rate Limit Window            |
| RATE_LIMIT_MAX       | Maximum Requests             |

---

# 📌 API Endpoints

## Authentication

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | `/api/auth/register` |
| POST   | `/api/auth/login`    |
| GET    | `/api/profile`       |

---

## Internships

| Method | Endpoint                          |
| ------ | --------------------------------- |
| POST   | `/api/internships`                |
| GET    | `/api/internships`                |
| GET    | `/api/internships/:id`            |
| PUT    | `/api/internships/:id`            |
| DELETE | `/api/internships/:id`            |
| GET    | `/api/internships/:id/applicants` |
| POST   | `/api/internships/:id/apply`      |

---

## Applications

| Method | Endpoint                       |
| ------ | ------------------------------ |
| GET    | `/api/applications/me`         |
| PUT    | `/api/applications/:id/status` |

---

## Dashboard

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | `/api/dashboard/recruiter` |
| GET    | `/api/dashboard/admin`     |

---

# 🔎 Query Parameters

Example:

```http
GET /internships?location=remote&skills=nodejs,react&status=open&search=backend&page=1&limit=10&sortBy=created_at&order=desc
```

Supported filters:

* location
* skills
* status
* search
* page
* limit
* sortBy
* order

---

# ❌ Error Response Format

```json
{
  "success": false,
  "message": "Invalid email format",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

# 🔄 Application Status Flow

```text
Applied
    ↓
Shortlisted
    ↓
Interview Scheduled
    ↓
Selected

Rejected ←────────┘
```

---

# 🚀 Deployment

The project can be deployed on:

* Render
* Railway
* AWS
* DigitalOcean

### Live API Documentation

📘 https://internship-backend-xlmv.onrender.com/api-docs

### Video Demonstration

🎥 https://youtu.be/fcRUbUAw8J0

---

# 🌟 Future Improvements

* Resume Parsing
* Email Notifications
* Redis Caching
* Refresh Tokens
* Token Revocation
* Automated Testing using Jest + Supertest

---

# 👩‍💻 Author

### Akshita Srivastava

B.Tech Computer Science Student

GitHub: https://github.com/Akshitasri8299

---

