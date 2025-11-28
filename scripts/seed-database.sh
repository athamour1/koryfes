#!/bin/bash

# Database Seeding Script
# Run this after fresh database creation to populate peaks, diplomas, and paths

echo "🌱 Seeding database with progress system data..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 3

# Seed progress data (peaks and guide diplomas)
echo "📊 Seeding peaks and guide diplomas..."
docker compose exec -T db psql -U postgres -d guide_badges < backend/seed-progress.sql

# Seed paths data
echo "🛤️  Seeding learning paths..."
docker compose exec -T db psql -U postgres -d guide_badges < backend/seed-paths.sql

# Seed elective diplomas if file exists
if [ -f "backend/diplomas-import.sql" ]; then
    echo "🎓 Seeding elective diplomas..."
    docker compose exec -T db psql -U postgres -d guide_badges < backend/diplomas-import.sql
fi

echo "✅ Database seeding complete!"
echo ""
echo "📋 Summary:"
docker compose exec -T db psql -U postgres -d guide_badges -c "
    SELECT 'Peaks' as type, COUNT(*)::text as count FROM peaks
    UNION ALL
    SELECT 'Guide Diplomas', COUNT(*)::text FROM guide_diplomas
    UNION ALL
    SELECT 'Paths', COUNT(*)::text FROM paths
    UNION ALL
    SELECT 'Elective Diplomas', COUNT(*)::text FROM elective_diplomas;
"
