#!/bin/bash
set -e

echo "Skipping database migrations for debug..."
# alembic -c backend/alembic.ini upgrade head

echo "Starting FastAPI server..."
uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} > /app/startup.log 2>&1 &
sleep 5
cat /app/startup.log
exit 1
