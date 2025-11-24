#!/bin/bash

# Default values
REGISTRY_URL=${REGISTRY_URL:-localhost}
TAG=${TAG:-latest}

echo "Building and pushing images to $REGISTRY_URL with tag $TAG"

# Build Backend
echo "Building Backend..."
docker build -t $REGISTRY_URL/scout-badges-backend:$TAG ./backend
docker build -t $REGISTRY_URL/scout-badges-backend:latest ./backend

# Build Frontend
echo "Building Frontend..."
# Note: VITE_API_URL needs to be set at build time for the frontend if it's baked in, 
# but usually for Nginx serving static files, we might need runtime config or just rely on relative paths/proxy.
# Assuming the frontend Dockerfile handles the build.
docker build -t $REGISTRY_URL/scout-badges-frontend:$TAG ./frontend
docker build -t $REGISTRY_URL/scout-badges-frontend:latest ./frontend

# Push Images (Optional - comment out if just building locally)
echo "Pushing images..."
docker push $REGISTRY_URL/scout-badges-backend:$TAG
docker push $REGISTRY_URL/scout-badges-backend:latest
docker push $REGISTRY_URL/scout-badges-frontend:$TAG
docker push $REGISTRY_URL/scout-badges-frontend:latest

echo "Done!"
