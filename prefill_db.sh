#!/bin/bash

# Ensure we are in the root directory
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

echo "Prefilling database with progress data..."
cat backend/seed-progress.sql | docker compose exec -T db psql -U postgres -d guide_badges

echo "Prefilling database with paths data..."
cat backend/seed-paths.sql | docker compose exec -T db psql -U postgres -d guide_badges

echo "Prefilling database with diplomas data..."
cat backend/diplomas-import.sql | docker compose exec -T db psql -U postgres -d guide_badges

echo "Database prefill complete."
