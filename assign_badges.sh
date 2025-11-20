#!/bin/bash

# Get admin auth token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Logged in as admin"
echo "Fetching users and badges..."

# Get all users
users_json=$(curl -s http://localhost:3000/users -H "Authorization: Bearer $TOKEN")

# Get all badges
badges_json=$(curl -s http://localhost:3000/badges)

# Extract user IDs for simple users only (not admins)
user_ids=$(echo "$users_json" | jq -r '.[] | select(.role == "user") | .id')

# Extract badge IDs
badge_ids=$(echo "$badges_json" | jq -r '.[].id')

# Convert to arrays
user_array=($user_ids)
badge_array=($badge_ids)

echo "Found ${#user_array[@]} simple users"
echo "Found ${#badge_array[@]} badges"
echo ""

# Counter
total_assignments=0

# For each user
for user_id in "${user_array[@]}"; do
  # Get username for display
  username=$(echo "$users_json" | jq -r ".[] | select(.id == $user_id) | .username")
  
  # Random number of badges between 3 and 12
  num_badges=$((3 + RANDOM % 10))
  
  # Shuffle badge array and take first num_badges
  selected_badges=$(printf '%s\n' "${badge_array[@]}" | shuf | head -n $num_badges)
  
  echo "Assigning $num_badges badges to $username (ID: $user_id)..."
  
  # Assign each badge
  for badge_id in $selected_badges; do
    response=$(curl -s -X POST "http://localhost:3000/users/$user_id/badges" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"badgeId\": $badge_id}" 2>&1)
    
    if echo "$response" | grep -q '"id"'; then
      total_assignments=$((total_assignments + 1))
    fi
  done
  
  echo "  ✓ Assigned $num_badges badges to $username"
done

echo ""
echo "========================================"
echo "✓ Assigned $total_assignments badges total!"
echo "  Across ${#user_array[@]} users"
echo "  Average: $((total_assignments / ${#user_array[@]})) badges per user"
echo "========================================"
