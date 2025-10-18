# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the application files
COPY . .

# Expose the port
EXPOSE 8081

# Start a simple HTTP server for the web application
CMD ["npx", "serve", "-s", ".", "-l", "8081"]
