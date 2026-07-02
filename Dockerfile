# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 2: runtime (production deps only, no TS source) ─────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Apply pending migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
