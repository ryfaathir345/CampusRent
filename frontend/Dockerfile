# Stage 1: Build the Vite React application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the application source code
COPY . .

# Pass VITE_API_URL from Railway build arguments to the environment for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the frontend application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
