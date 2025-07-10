# Stage 1: build with Vite
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && \
    npm install

# Copy source code
COPY . .

# Clear esbuild cache and build
RUN rm -rf node_modules/.cache && \
    npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine
# wipe default content (optional, but clean)
RUN rm -rf /usr/share/nginx/html/*
# copy the dist folder
COPY --from=builder /app/dist /usr/share/nginx/html/
# copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]