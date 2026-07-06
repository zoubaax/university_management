# Use official lightweight Node.js image
FROM node:20-alpine AS base

# Create and define the working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose port the app runs on
EXPOSE 5000

# Set production environment by default
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/server.js"]
