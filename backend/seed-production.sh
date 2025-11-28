#!/bin/bash
# Seed production database running in Docker Compose

echo "⚠️  WARNING: This will DELETE existing data in 'peaks', 'guide_diplomas', and 'user_progress' tables!"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Check if docker compose is running
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Docker Compose is not running. Please start it first."
    exit 1
fi

echo "🌱 Seeding Peaks and Guide Diplomas..."
docker compose exec -T db psql -U postgres -d guide_badges < backend/seed-progress.sql

echo "🌱 Seeding Paths..."
docker compose exec -T db psql -U postgres -d guide_badges < backend/seed-paths.sql

echo "🌱 Seeding Elective Diplomas..."
docker compose exec -T db psql -U postgres -d guide_badges < backend/diplomas-import.sql

echo "✅ Seeding complete!"
