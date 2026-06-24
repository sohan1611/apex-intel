#!/bin/bash
set -e

echo "Skipping database migrations for debug..."
# alembic -c backend/alembic.ini upgrade head

echo "Sleeping for debugging..."
while true; do
  sleep 60
done
