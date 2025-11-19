# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app

# Build arguments
ARG VITE_API_URL=http://localhost:3000
ARG VITE_ENV=development

# Set as environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
