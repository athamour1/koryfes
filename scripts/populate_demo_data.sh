#!/bin/bash
# ------------------------------------------------------------
# Demo Data Population Script for scout-badges
# ------------------------------------------------------------

set -euo pipefail

# Helper to run psql with quiet mode for commands that don't return values
run_psql() {
  docker compose exec -T db psql -U postgres -d guide_badges -t -A -q -c "$1" 2>/dev/null
}

# ----------------------------------------------------------------
# Data definitions
# ----------------------------------------------------------------
LOCATIONS=("ΤΤ Μεγαρων" "ΤΤ Ελευσινας" "ΤΤ Σαλαμινας" "ΤΤ Ηρακλειου")

UNITS_SPACE=("Αστροναύτης" "Δορυφόρος" "Γαλαξίας" "Πλανήτης")
UNITS_TREES=("Ελιά" "Πεύκη" "Κυπαρισσός" "Δρυς")
UNITS_ANIMALS=("Λύκος" "Αετός" "Δελφίνι" "Ιπποπόταμος")
UNITS_MYTHIC=("Ηρακλής" "Περσέας" "Αχιλλέας" "Οδυσσέας")

FIRST_NAMES=("Αλέξανδρος" "Δημήτρης" "Γεώργιος" "Νικόλαος" "Ιωάννης" "Σπύρος" "Κωνσταντίνος" "Αθανάσιος")
LAST_NAMES=("Παπαδόπουλος" "Καραμανλής" "Αλεξίου" "Δημητρίου" "Γεωργίου" "Σπυρόπουλος" "Κωνσταντίνου" "Αθανάσου")

# ----------------------------------------------------------------
# Helper functions
# ----------------------------------------------------------------
get_location_id() {
  local name="$1"
  local id=$(run_psql "SELECT id FROM location WHERE name = '$name';")
  if [ -z "$id" ]; then
    id=$(run_psql "INSERT INTO location (name) VALUES ('$name') RETURNING id;")
  fi
  echo "$id"
}

get_unit_id() {
  local name="$1" loc_id="$2"
  local id=$(run_psql "SELECT id FROM unit WHERE name = '$name' AND \"locationId\" = $loc_id;")
  if [ -z "$id" ]; then
    id=$(run_psql "INSERT INTO unit (name, \"locationId\") VALUES ('$name', $loc_id) RETURNING id;")
  fi
  echo "$id"
}

# ----------------------------------------------------------------
# Main population logic
# ----------------------------------------------------------------
for idx in "${!LOCATIONS[@]}"; do
  loc_name="${LOCATIONS[$idx]}"
  echo "Processing location: $loc_name"
  loc_id=$(get_location_id "$loc_name")

  # Admin user
  admin_username="admin_$(($idx+1))"
  existing_admin=$(run_psql "SELECT id FROM \"user\" WHERE username = '$admin_username';")
  if [ -z "$existing_admin" ]; then
    echo "  → Creating admin: $admin_username"
    run_psql "INSERT INTO \"user\" (username, password, role, \"isAdmin\", \"locationId\") VALUES ('$admin_username', 'test', 'admin', true, $loc_id);" > /dev/null
  else
    echo "  → Admin $admin_username already exists"
  fi

  # Choose unit set per location
  case $idx in
    0) UNIT_SET=("${UNITS_SPACE[@]}") ;;
    1) UNIT_SET=("${UNITS_TREES[@]}") ;;
    2) UNIT_SET=("${UNITS_ANIMALS[@]}") ;;
    3) UNIT_SET=("${UNITS_MYTHIC[@]}") ;;
  esac

  for u_idx in "${!UNIT_SET[@]}"; do
    unit_name="${UNIT_SET[$u_idx]}"
    echo "    → Unit: $unit_name"
    unit_id=$(get_unit_id "$unit_name" "$loc_id")

    for usr_idx in {1..5}; do
      fn="${FIRST_NAMES[$(( (idx*4 + u_idx*5 + usr_idx) % ${#FIRST_NAMES[@]} ))]}"
      ln="${LAST_NAMES[$(( (idx*4 + u_idx*5 + usr_idx) % ${#LAST_NAMES[@]} ))]}"
      username="${fn,,}_${ln,,}_$((idx+1))_$((u_idx+1))_$usr_idx"
      role="user"
      unit_role="member"
      if [ "$usr_idx" -eq 1 ]; then
        unit_role="leader"
      elif [ "$usr_idx" -eq 2 ]; then
        unit_role="deputy_leader"
      fi
      existing_user=$(run_psql "SELECT id FROM \"user\" WHERE username = '$username';")
      if [ -z "$existing_user" ]; then
        echo "      → Creating user: $username ($unit_role)"
        run_psql "INSERT INTO \"user\" (username, password, role, \"isAdmin\", \"locationId\", \"unitId\", \"unitRole\") VALUES ('$username', 'test', '$role', false, $loc_id, $unit_id, '$unit_role');" > /dev/null
      else
        echo "      → User $username already exists"
      fi
    done
  done
done

echo "Demo data population complete."
