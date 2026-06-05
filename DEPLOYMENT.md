# Apex Intel — Deployment Guide

This document outlines how to deploy the Apex Intel stack (FastAPI backend, Next.js frontend, and PostgreSQL) either locally via Docker Compose or on a production PaaS (like Railway or Render).

## 1. Local Production Setup (Docker Compose)

The easiest way to run the entire stack locally in a production-like environment is using Docker Compose. This spins up the database, backend, and frontend containers automatically.

### Prerequisites
* Docker and Docker Compose installed.

### Steps
1. Copy the environment templates:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```
2. Fill in the required variables (especially `OPENAI_API_KEY` and `SERPER_API_KEY` in `backend/.env`).
3. Build and start the containers:
   ```bash
   docker compose up --build -d
   ```
4. Verify health:
   * Frontend: http://localhost:3000
   * Backend API: http://localhost:8000/health

---

## 2. Database Migrations (Alembic)

We use Alembic to manage PostgreSQL database migrations. Note: While `DEBUG=True` allows the backend to automatically create tables on startup, this is disabled in production to prevent schema corruption.

### Generate Initial Migration (First-time setup)
When you first run the PostgreSQL container, you need to generate the initial migration schema:

```bash
# Enter the backend container
docker compose exec backend bash

# Run autogenerate (looks at models.py and creates the script)
alembic revision --autogenerate -m "Initial migration"

# Apply the migration to the database
alembic upgrade head
```

### Migration Workflow (Updating the schema)
Whenever you modify `models.py`:
1. `alembic revision --autogenerate -m "description of change"`
2. `alembic upgrade head`
3. To rollback: `alembic downgrade -1`

---

## 3. Deploying to Railway / Render

Railway and Render are PaaS providers that natively support Docker monorepos.

### Railway Deployment
1. Create a **New Project** on Railway.
2. Provision a **PostgreSQL** plugin. This will automatically expose a `DATABASE_URL` environment variable.
3. Deploy the **Backend**:
   * Connect your GitHub repo.
   * Set the root directory to `/backend`.
   * Railway will automatically detect the `Dockerfile`.
   * Add your environment variables (`OPENAI_API_KEY`, `SERPER_API_KEY`, `CORS_ORIGINS=["https://your-frontend-domain.app"]`, etc.).
   * Under Deploy settings, set the Start Command to: `alembic upgrade head && uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Deploy the **Frontend**:
   * Add another service from the same repo.
   * Set the root directory to `/frontend`.
   * Add the environment variable `NEXT_PUBLIC_API_URL` pointing to the Railway URL of your backend service.
   * Railway will build the standalone Next.js image using the `Dockerfile`.

### Render Deployment
1. Create a **PostgreSQL** database on Render.
2. Create a **Web Service** for the backend:
   * Select Docker environment.
   * Root directory: `backend`.
   * Set the environment variables.
3. Create a **Web Service** for the frontend:
   * Select Docker environment.
   * Root directory: `frontend`.
   * Build arguments: `NEXT_PUBLIC_API_URL=<backend-url>`.

## 4. Required Environment Variables

### Backend
* `DATABASE_URL`: PostgreSQL connection string (must use `postgresql+asyncpg://` protocol).
* `OPENAI_API_KEY`: Required for AI agents.
* `SERPER_API_KEY`: Required for SearchService.
* `CORS_ORIGINS`: JSON array of allowed frontend URLs (e.g., `["https://apex-intel.app"]`).
* `DEBUG`: Set to `False` in production.

### Frontend
* `NEXT_PUBLIC_API_URL`: The URL of the FastAPI backend.
