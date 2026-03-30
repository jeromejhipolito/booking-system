# BookIt — Service Booking Platform for Metro Manila

Independent service providers in Metro Manila lose bookings to Messenger DMs and manual scheduling. This platform gives each provider a shareable booking link with real-time availability.

Built solo by **Jerome Hipolito** — NestJS (Fastify) + Next.js 14 + PostgreSQL + BullMQ.

---

## Architecture Decisions

### ADR 1: Double-booking prevention via PostgreSQL EXCLUSION constraint

**Decision:** PostgreSQL `EXCLUSION` constraint with `tstzrange && operator` on the bookings table.

**Rejected alternatives:**
- Application-level check-then-insert — TOCTOU race condition under concurrent load
- Redis distributed lock — adds external dependency, still not atomic with the DB write

**Result:** The database guarantees zero double-bookings under concurrent requests. No application code needed for conflict detection.

### ADR 2: Guest checkout with HMAC-signed access tokens

**Decision:** HMAC-signed access tokens embedded in email links for cancel/reschedule without login.

**Rejected alternatives:**
- Forcing registration — increases abandonment for a booking flow
- JWT for guests — requires a user record to exist
- Unsigned tokens — trivially spoofable

**Result:** Guests manage their bookings via email links. No account required. Tokens are tamper-proof and verified with timing-safe comparison.

### ADR 3: Outbox pattern for reliable notifications

**Decision:** `outbox_events` table processed with `SELECT FOR UPDATE SKIP LOCKED`, backed by BullMQ for immediate processing.

**Rejected alternatives:**
- Inline `sendEmail()` in command handler — synchronous failure blocks the booking
- Fire-and-forget async — no retry, no audit trail
- BullMQ alone without outbox — loses events if Redis goes down

**Result:** Belt-and-suspenders reliability: outbox table for durability guarantee, BullMQ for speed. Exponential backoff retries (5 attempts). Cron sweep as fallback.

### ADR 4: Webhook system with HMAC-signed delivery

**Decision:** Outbound webhooks signed with HMAC-SHA256, delivered via BullMQ with exponential backoff. Inbound webhooks verified with timing-safe signature comparison and idempotent on external event ID.

**Rejected alternatives:**
- Synchronous delivery in request handler — blocks the booking flow
- Unsigned payloads — no tamper detection for receivers

**Result:** Providers receive real-time booking events at their registered URLs. External services (Shopify, carriers) can push events with guaranteed deduplication.

---

## What Was Deliberately NOT Built

- **Payment processing** — Booking abandonment is caused by form friction, not payment hesitation. Validating the flow first.
- **Microservices** — Modules are cleanly separated by domain boundary (booking, provider, notification, webhook). Splitting into services adds distributed complexity with zero benefit at this scale.
- **Redis caching** — Slot queries hit a single date partition and return in <10ms. Would add Redis caching at 100x current load.

---

## Tech Stack

- **Backend:** NestJS (Fastify adapter), TypeORM, PostgreSQL, BullMQ + Redis, CQRS
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Zustand
- **Infrastructure:** Docker Compose, GitHub Actions CI, Pino structured logging
- **Monorepo:** pnpm workspaces + Turborepo
- **Shared Packages:** Types, Zod schemas, constants, utilities

## Key Backend Features

- **Fastify** HTTP adapter (swapped from Express)
- **BullMQ** queues for notifications + webhook delivery with exponential backoff
- **Outbound webhooks** — HMAC-SHA256 signed, delivery log with retry tracking
- **Inbound webhooks** — signature verification, idempotent dedup on external event ID
- **Structured logging** — Pino with JSON output, X-Request-Id correlation
- **CQRS** — commands, queries, and domain events via NestJS CqrsModule
- **TypeORM migrations** — 11 individual migrations with `up()` and `down()` rollback
- **124 tests** — 86 backend unit, 17 frontend, 21 e2e integration

---

## Quick Start

### Demo Mode (no backend needed)

```bash
pnpm install
echo "NEXT_PUBLIC_DEMO_MODE=true" > apps/web/.env.local
cd apps/web && npx next dev --port 3002
```

### Full Stack

```bash
# 1. Start databases
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Build shared packages
for pkg in shared-types shared-schemas shared-constants shared-utils; do
  (cd packages/$pkg && npx tsc)
done

# 4. Run database migrations
cd apps/api && pnpm migration:run

# 5. Start API
cd apps/api && npx nest start

# 6. Start frontend (new terminal)
cd apps/web && npx next dev --port 3002
```

### Database Migrations

```bash
cd apps/api
pnpm migration:run      # apply pending migrations
pnpm migration:revert   # rollback last migration
pnpm migration:show     # list migration status
```

### Running Tests

```bash
# Backend unit tests (no DB required)
cd apps/api && pnpm test:unit

# Backend e2e tests (requires running API + DB)
cd apps/api && pnpm test:e2e

# Frontend tests
cd apps/web && pnpm test
```

---

## Project Structure

```
booking-system/
├── apps/
│   ├── api/                          # NestJS backend (port 3001)
│   │   ├── src/
│   │   │   ├── database/
│   │   │   │   ├── data-source.ts    # TypeORM CLI config
│   │   │   │   └── migrations/       # 11 individual migrations
│   │   │   ├── modules/
│   │   │   │   ├── booking/          # CQRS commands, queries, events
│   │   │   │   ├── notification/     # Outbox + BullMQ processors
│   │   │   │   ├── webhook/          # Outbound + inbound webhooks
│   │   │   │   ├── provider/
│   │   │   │   ├── service/
│   │   │   │   ├── customer/
│   │   │   │   ├── availability/
│   │   │   │   ├── review/
│   │   │   │   └── user/
│   │   │   └── health/               # DB + Redis health checks
│   │   └── test/                     # E2E integration tests
│   └── web/                          # Next.js frontend (port 3002)
├── packages/
│   ├── shared-types/
│   ├── shared-schemas/               # Zod validation schemas
│   ├── shared-constants/
│   └── shared-utils/
├── .github/workflows/ci.yml          # GitHub Actions pipeline
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Deploy to Vercel (Frontend Only — Demo Mode)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjeromejhipolito%2Fbooking-system&env=NEXT_PUBLIC_DEMO_MODE&envDescription=Set%20to%20true%20for%20demo%20mode&project-name=booking-system&root-directory=apps/web)

**Root Directory:** `apps/web`
**Build Command:** `cd ../.. && pnpm install && pnpm --filter @booking/shared-types build && pnpm --filter @booking/shared-schemas build && pnpm --filter @booking/shared-constants build && pnpm --filter @booking/shared-utils build && cd apps/web && npx next build`
**Environment Variable:** `NEXT_PUBLIC_DEMO_MODE=true`

## API Documentation

Start the API, then visit: http://localhost:3001/api-docs
