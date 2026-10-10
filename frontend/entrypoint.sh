#!/bin/sh
set -e

# Escape a value for a double-quoted JS string
js_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

# Generate config.js from environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.appConfig = {
  apiUrl: "$(js_escape "${VITE_API_URL:-/api}")",
  env: "$(js_escape "${VITE_ENV:-production}")",
  stagingMessage: "$(js_escape "${VITE_STAGING_MESSAGE}")"
};
EOF

# Start Nginx
exec "$@"
