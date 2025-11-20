#!/bin/bash

# Badge images directory
BADGE_DIR="/home/thanos98/Downloads/www_scouts_org_uk"

# Get admin auth token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Logged in as admin"
echo "Creating badges from images in $BADGE_DIR..."
echo ""

# Counter for created badges
count=0

# Loop through all PNG files
for file in "$BADGE_DIR"/*.png; do
  # Get just the filename without path
  filename=$(basename "$file")
  
  # Extract badge name from filename (remove timestamp and extension)
  # Example: activity-sc-air-spotter_1763572485793.png -> activity-sc-air-spotter
  badge_name=$(echo "$filename" | sed 's/_[0-9]*\.png$//')
  
  # Convert hyphens to spaces and capitalize words for display name
  display_name=$(echo "$badge_name" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
  
  # Create description from name
  description="Scout activity badge: $display_name"
  
  # Create the badge with image upload
  response=$(curl -s -X POST http://localhost:3000/badges \
    -H "Authorization: Bearer $TOKEN" \
    -F "name=$display_name" \
    -F "description=$description" \
    -F "file=@$file")
  
  # Check if successful (basic check)
  if echo "$response" | grep -q '"id"'; then
    count=$((count + 1))
    echo "✓ Created badge #$count: $display_name"
  else
    echo "✗ Failed to create: $display_name"
    echo "  Response: $response"
  fi
done

echo ""
echo "========================================" 
echo "✓ Created $count badges successfully!"
echo "========================================"
