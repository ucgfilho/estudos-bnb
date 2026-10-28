# Multi-stage build for full-stack production image (Frontend SPA + SOLID Backend API + SQLite DB)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
RUN npm ci

# Copy full source tree (excluding .env and data/ via .dockerignore)
COPY . .

# Build frontend bundle (dist/) and backend server bundle (dist-server/)
RUN npm run build

# Runner stage using Node 22 Alpine (includes native node:sqlite & node:crypto)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV DB_PATH=/app/data/bnb_estudos.sqlite
ENV SEED_FILE_PATH=/app/data/initial-workspace.seed.json

# Copy compiled frontend and backend artifacts + relational schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/server/database/schema.sql ./server/database/schema.sql

RUN mkdir -p /app/data

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/api/health || exit 1

CMD ["node", "dist-server/index.js"]
