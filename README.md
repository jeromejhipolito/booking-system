# BookEasy — Flexible Booking System

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL + Redis)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start databases
docker compose up -d

# 3. Run database migration
docker exec -i booking-postgres psql -U booking_user -d booking_system < apps/api/src/database/migrations/001-initial-schema.sql

# 4. Copy environment file
cp .env apps/api/.env

# 5. Build shared packages
for pkg in shared-types shared-schemas shared-constants shared-utils; do
  cd packages/$pkg && npx tsc -p tsconfig.build.json && cd ../..
done

# 6. Build API
cd apps/api && npx nest build && cd ../..

# 7. Start API (port 3001)
cd apps/api && node dist/apps/api/src/main.js &

# 8. Start Frontend (port 3002)
cd apps/web && npx next dev --port 3002
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_HOST | localhost | PostgreSQL host |
| DATABASE_PORT | 5432 | PostgreSQL port |
| DATABASE_NAME | booking_system | Database name |
| DATABASE_USER | booking_user | Database user |
| DATABASE_PASSWORD | booking_pass | Database password |
| REDIS_HOST | localhost | Redis host |
| JWT_SECRET | change-me | JWT signing secret |
| CORS_ORIGINS | http://localhost:3000,http://localhost:3002 | Allowed origins |

### Tech Stack

- **Backend:** NestJS + TypeScript + PostgreSQL + Redis + CQRS
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Zustand
- **Monorepo:** Turborepo with shared packages (types, schemas, utils)

### Project Structure

```
booking-system-v2/
├── apps/api/          # NestJS backend
├── apps/web/          # Next.js frontend
├── packages/
│   ├── shared-types/  # TypeScript interfaces
│   ├── shared-schemas/ # Zod validation
│   ├── shared-constants/ # Business rules
│   └── shared-utils/  # Timezone helpers
└── docker-compose.yml
```

### API Documentation

Start the API, then visit: http://localhost:3001/api-docs
