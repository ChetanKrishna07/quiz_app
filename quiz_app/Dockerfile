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

# Stage 2: serve with caddy
FROM caddy:2-alpine

# copy the dist folder into Caddy's root
COPY --from=builder /app/dist /usr/share/caddy

# Copy Caddyfile into the container
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port 80 for http and 443 for https
EXPOSE 80 443

# No need to run a command, Caddy will start automatically