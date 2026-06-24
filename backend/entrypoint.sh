#!/bin/bash
set -e

echo "Running database migrations..."
alembic -c backend/alembic.ini upgrade head

echo "Starting FastAPI server..."
exec "$@"
