#!/bin/bash
set -e

echo "Skipping database migrations for debug..."
# alembic -c backend/alembic.ini upgrade head

python -m http.server ${PORT:-8000} &
echo "Starting Uvicorn in foreground to capture logs..."
uvicorn backend.main:app --host 0.0.0.0 --port 8001 || echo "Uvicorn crashed with $?"

echo "Keeping container alive for debugging..."
while true; do
  sleep 60
done
