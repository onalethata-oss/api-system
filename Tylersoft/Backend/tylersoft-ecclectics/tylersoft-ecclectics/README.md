# Tylersoft Ecclectics — Monorepo

Full-stack application with role-based authentication.

## Stack
- **Backend**: Spring Boot 3, Spring Security, JWT, PostgreSQL, JPA/Hibernate
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL 16

## Quick Start

### With Docker (recommended)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend:  http://localhost:8080

### Without Docker
```bash
# 1. Start PostgreSQL locally, create DB: tylersoft_db
# 2. Backend
cd backend && ./mvnw spring-boot:run

# 3. Frontend
cd frontend && npm install && npm run dev
```

## Default Admin Account
- Email: `admin@tylersoft.com`
- Password: `Admin@123`
- **Change this immediately after first login.**

## Project Structure
```
tylersoft-ecclectics/
├── backend/    Spring Boot API (port 8080)
├── frontend/   Next.js UI    (port 3000)
└── shared/     TypeScript types shared between FE/BE
```
