# =============================================================================
# STAGE 1: Builder - Build React application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files FIRST for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =============================================================================
# STAGE 2: Runtime - Minimal Nginx image
# =============================================================================
FROM nginx:alpine-slim AS runtime

# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
