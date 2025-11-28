#!/bin/sh

# Fix permissions for uploads directory
# This runs as root before switching to the non-root user
if [ -d "/usr/src/app/uploads" ]; then
  chown -R nestjs:nodejs /usr/src/app/uploads
fi

# Execute the command as the nestjs user
exec su-exec nestjs:nodejs "$@"
