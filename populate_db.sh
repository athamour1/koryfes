#!/bin/bash

# Get admin auth token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Logged in as admin"
echo "Creating captains and users..."

# Create 3 captains (one for each TT location)
echo "Creating captain for TT Megarwn..."
curl -s -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"captain_megarwn","password":"password123","role":"admin","locationName":"TT Megarwn"}' > /dev/null

echo "Creating captain for TT Eleysinas..."
curl -s -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"captain_eleysinas","password":"password123","role":"admin","locationName":"TT Eleysinas"}' > /dev/null

echo "Creating captain for TT Salaminas..."
curl -s -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"captain_salaminas","password":"password123","role":"admin","locationName":"TT Salaminas"}' > /dev/null

echo "✓ Created 3 captains"
echo ""

# Create 10 users for TT Megarwn
echo "Creating 10 users for TT Megarwn..."
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/users \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user_megarwn_$i\",\"password\":\"password123\",\"role\":\"user\",\"locationName\":\"TT Megarwn\"}" > /dev/null
  echo "  Created user_megarwn_$i"
done

# Create 10 users for TT Eleysinas
echo "Creating 10 users for TT Eleysinas..."
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/users \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user_eleysinas_$i\",\"password\":\"password123\",\"role\":\"user\",\"locationName\":\"TT Eleysinas\"}" > /dev/null
  echo "  Created user_eleysinas_$i"
done

# Create 10 users for TT Salaminas
echo "Creating 10 users for TT Salaminas..."
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/users \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user_salaminas_$i\",\"password\":\"password123\",\"role\":\"user\",\"locationName\":\"TT Salaminas\"}" > /dev/null
  echo "  Created user_salaminas_$i"
done

echo ""
echo "✓ Created 30 users total (10 for each location)"
echo ""
echo "Summary:"
echo "- 3 captains (captain_megarwn, captain_eleysinas, captain_salaminas)"
echo "- 30 users across 3 locations"
echo "- All passwords: password123"
