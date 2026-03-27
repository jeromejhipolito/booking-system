# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./

RUN cd apps/api && npx nest build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 3001

CMD ["node", "dist/apps/api/src/main.js"]
