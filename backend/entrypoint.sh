#!/bin/bash
set -e

echo "Skipping database migrations for debug..."
# alembic -c backend/alembic.ini upgrade head

echo "Starting FastAPI server..."
"$@" || { echo "Server crashed with exit code $?"; sleep 60; exit 1; }
