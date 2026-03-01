# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
# Build with: docker build --build-arg BACKEND_URL=http://backend-cap:4004 -t prapp-frontend .
# For BTP:    docker build --build-arg BACKEND_URL=https://prapp-backend.<cf-domain> -t prapp-frontend .
FROM nginx:alpine
ARG BACKEND_URL=http://backend-cap:4004
ENV BACKEND_URL=$BACKEND_URL
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
RUN envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && rm /etc/nginx/conf.d/default.conf.template
EXPOSE 3000
