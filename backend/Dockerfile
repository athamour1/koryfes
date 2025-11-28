# ============================================
# Build Stage
# ============================================
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
# Use npm install if package-lock.json doesn't exist, otherwise use npm ci
RUN if [ -f package-lock.json ]; then \
    npm ci; \
    else \
    npm install; \
    fi

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM node:20-alpine AS production

# Install dumb-init and su-exec
RUN apk add --no-cache dumb-init su-exec

# Create app directory
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Create uploads directory
RUN mkdir -p /usr/src/app/uploads

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Use npm install if package-lock.json doesn't exist, otherwise use npm ci
RUN if [ -f package-lock.json ]; then \
    npm ci --omit=dev; \
    else \
    npm install --omit=dev; \
    fi && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/dist ./dist

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init and entrypoint script
ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/docker-entrypoint.sh"]

# Start the application
CMD ["node", "dist/src/main"]
