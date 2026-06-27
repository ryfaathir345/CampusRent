# Stage 1: Build the Vite React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the application source code
COPY . .

# Build the frontend application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default Nginx port (Railway will detect this or you can set PORT variable)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
