#!/bin/sh

# Generate config.js from environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.appConfig = {
  apiUrl: "${VITE_API_URL:-/api}",
  env: "${VITE_ENV:-development}",
  stagingMessage: "${VITE_STAGING_MESSAGE}"
};
EOF

# Start Nginx
exec "$@"
