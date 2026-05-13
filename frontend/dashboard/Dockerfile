# ── Frontend – React/Vite ──────────────────────────────────────
# Etapa 1: build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build          # genera /app/dist

# Etapa 2: servir con nginx
FROM nginx:alpine

# Configuración de nginx con proxy al backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los estáticos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80