#!/bin/bash
set -e

echo "Skipping database migrations temporarily to break lock..."
# alembic -c backend/alembic.ini upgrade head

echo "Starting FastAPI server..."
exec "$@"
