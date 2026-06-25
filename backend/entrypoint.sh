#!/bin/bash
set -e

echo "Running database migrations..."
alembic upgrade head || echo "Migrations failed, continuing anyway..."

echo "Starting FastAPI server on port ${PORT:-8080}..."
exec python -m uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8080}"
