# ==========================================
# Build Stage
# ==========================================
FROM imbios/bun-node:18-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy application
COPY . .

# ==========================================
# Build Arguments
# ==========================================

ARG VITE_BACKEND_URL
ARG AZURE_STORAGE_CONTAINER_NAME

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV AZURE_STORAGE_CONTAINER_NAME=$AZURE_STORAGE_CONTAINER_NAME

# Build application
RUN bun run build

# ==========================================
# Runtime Stage
# ==========================================

FROM nginx:1.27-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]