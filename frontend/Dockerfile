# Build Stage
FROM node:24-alpine AS build-stage

WORKDIR /app

# Install dependencies first so they're cached until a lockfile changes.
# Scripts are skipped here: postinstall (quasar prepare) needs the sources.
COPY package.json package-lock.json ./
COPY src-pwa/package.json src-pwa/package-lock.json ./src-pwa/
RUN npm ci --ignore-scripts && npm ci --ignore-scripts --prefix src-pwa

COPY . .

# The image is environment-agnostic: API URL etc. are written to config.js at
# container start by entrypoint.sh, so no build args here
RUN npx quasar build -m pwa

# Production Stage
FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist/pwa /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
