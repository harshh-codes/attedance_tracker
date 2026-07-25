# Landmark Developers Employee Attendance Tracking System

An enterprise-grade, geofenced GPS employee attendance tracking, employee management, and HR analytics platform built for **Landmark Developers**.

---

## 🚀 Key Features & Capabilities

- **🔐 Enterprise Security & Auth**: Short-lived Access Tokens (15m) + Long-lived Refresh Tokens (7d) with automatic token rotation, HTTP-only cookies, bcrypt hashing, and rate limiting.
- **📍 GPS Geofenced Punch-In**: Haversine distance verification in meters against office coordinates. Prevents fake remote attendance. Single daily punch-in constraint.
- **👥 Admin Employee CRUD**: Full employee lifecycle portal (Add, Edit, Activate, Deactivate, Reset Password, Soft Delete, Search, Multi-Filter, Paginate).
- **📊 Analytics & Reporting**: Interactive trends, departmental compliance rates, and one-click report exports in **Native Excel (.xlsx)**, **CSV**, and **Printable PDF**.
- **🛡️ Security Command Center**: Tracks failed login attempts, 15-minute account lockouts, active user sessions, remote revocation (`/logout-all`), and health telemetry (`/api/health`).
- **⚙️ System Configuration**: Office coordinates, geofence radius, working hours, and corporate branding managed via UI.
- **🐳 Docker & DevOps Ready**: Production Dockerfiles, Nginx reverse proxy config, Docker Compose orchestration, and GitHub Actions CI/CD workflows.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, PostgreSQL, Prisma ORM, JWT, bcryptjs, Winston, Swagger UI.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios.
- **DevOps**: Docker, Docker Compose, Nginx, GitHub Actions.

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js >= 20.x
- PostgreSQL >= 15.x
- Docker & Docker Compose (Optional)

### 1. Database Setup & Seeding
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
```

### 2. Start Backend Server
```bash
# In backend/
npm run dev
# Running at http://localhost:5000
# Swagger API Specs at http://localhost:5000/api-docs
```

### 3. Start Frontend Client
```bash
# In frontend/
npm install
npm run dev
# Running at http://localhost:5173
```

---

## 🐳 Running with Docker Compose

Run the complete multi-container stack (PostgreSQL + Backend + Nginx Frontend):

```bash
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost`
- **Backend API**: `http://localhost:5000/api`
- **Swagger Documentation**: `http://localhost:5000/api-docs`

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@landmarkdevelopers.com` | `Admin@123` |
| **Employee** | `rajesh.sharma@landmarkdevelopers.com` | `Employee@123` |

---

## 📜 API Documentation

Interactive OpenAPI 3.0 documentation is mounted at `/api-docs`.

Key Endpoints:
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/attendance/punch-in`
- `GET /api/admin/attendance/summary`
- `GET /api/admin/attendance/export/excel`
- `GET /api/health`

---

## 📄 License & Confidentiality

© 2026 **Landmark Developers**. Confidential Enterprise Software. All rights reserved.
