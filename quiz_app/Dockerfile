# Stage 1: build with Vite
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

# bring in your source
COPY . .
# this produces /app/dist
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine
# wipe default content (optional, but clean)
RUN rm -rf /usr/share/nginx/html/*
# copy the dist folder
COPY --from=builder /app/dist /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]