# Build Stage
FROM node:20-alpine as build-stage

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ARG VITE_ENV

# Set them as environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV

COPY package*.json ./

COPY . .

RUN npm install

RUN npx quasar build -m pwa

# Production Stage
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist/pwa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
