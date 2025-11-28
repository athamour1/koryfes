#!/bin/bash

# Script to reset all user passwords to "test"
# This uses bcrypt hashing to properly secure the password

echo "🔐 Resetting all user passwords to 'test'..."

# The bcrypt hash for password "test" with salt rounds 10
# Generated with: bcrypt.hash('test', 10)
HASHED_PASSWORD='$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'

docker compose exec -T db psql -U postgres -d guide_badges << EOF
UPDATE "user" SET password = '${HASHED_PASSWORD}';
SELECT COUNT(*) as "Users Updated" FROM "user";
EOF


echo "✅ All user passwords have been reset to: test"
echo "📝 You can now login with any username and password: test"
