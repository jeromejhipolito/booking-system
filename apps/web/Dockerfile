# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY apps/web/ ./apps/web/
COPY tsconfig.base.json ./

RUN cd apps/web && npx next build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
