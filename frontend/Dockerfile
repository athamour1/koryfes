# Build Stage
FROM node:20-alpine as build-stage

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ARG VITE_ENV
ARG VITE_STAGING_MESSAGE

# Set them as environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV
ENV VITE_STAGING_MESSAGE=$VITE_STAGING_MESSAGE

# Copy all application files
COPY . .

# Install dependencies
RUN npm install

# Build the application
RUN npx quasar build -m pwa

# Production Stage
FROM nginx:stable-alpine as production-stage

# Copy built application
COPY --from=build-stage /app/dist/pwa /usr/share/nginx/html

# Copy nginx configuration and entrypoint script
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
