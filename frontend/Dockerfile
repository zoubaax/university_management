# Stage 1: Build the React Application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set Vite build arguments (if we want to customize them during build)
ARG VITE_API_URL=http://localhost:5000/api/v1
ARG VITE_STORAGE_URL=http://localhost:5000

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STORAGE_URL=$VITE_STORAGE_URL

# Build the SPA bundle
RUN npm run build

# Stage 2: Serve the SPA with Nginx
FROM nginx:alpine

# Copy built assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
