# BookIt — Service Booking Platform for Metro Manila

Independent service providers in Metro Manila lose bookings to Messenger DMs and manual scheduling. This platform gives each provider a shareable booking link with real-time availability.

Built solo by **Jerome Hipolito** — NestJS + Next.js 14 + PostgreSQL.

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

**Result:** Guests manage their bookings via email links. No account required. Tokens are tamper-proof and expire.

### ADR 3: Outbox pattern for reliable notifications

**Decision:** `outbox_events` table processed with `SELECT FOR UPDATE SKIP LOCKED`.

**Rejected alternatives:**
- Inline `sendEmail()` in command handler — synchronous failure blocks the booking
- Fire-and-forget async — no retry, no audit trail

**Result:** Reliable notification delivery with automatic retry. Safe for multi-instance deployments.

---

## What Was Deliberately NOT Built

- **Payment processing** — Booking abandonment is caused by form friction, not payment hesitation. Validating the flow first.
- **Microservices** — Modules are cleanly separated by domain boundary (booking, provider, notification). Splitting into services adds distributed complexity with zero benefit at this scale.
- **Redis caching** — Slot queries hit a single date partition and return in <10ms. Would add Redis at 100x current load.

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Zustand
- **Backend:** NestJS, TypeORM, PostgreSQL, JWT, CQRS
- **Monorepo:** pnpm workspaces + Turborepo
- **Shared Packages:** Types, Zod schemas, constants, utilities

## Quick Start

### Demo Mode (no backend needed)

```bash
pnpm install
echo "NEXT_PUBLIC_DEMO_MODE=true" > apps/web/.env.local
cd apps/web && npx next dev --port 3002
```

### Full Stack

```bash
docker compose up -d
pnpm install
# Build shared packages, then start API + frontend
```

See detailed setup instructions in the [deployment section](#deploy-to-vercel-frontend-only--demo-mode) below.

---

## Deploy to Vercel (Frontend Only — Demo Mode)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjeromejhipolito%2Fbooking-system&env=NEXT_PUBLIC_DEMO_MODE&envDescription=Set%20to%20true%20for%20demo%20mode&project-name=booking-system&root-directory=apps/web)

**Root Directory:** `apps/web`
**Build Command:** `cd ../.. && pnpm install && pnpm --filter @booking/shared-types build && pnpm --filter @booking/shared-schemas build && pnpm --filter @booking/shared-constants build && pnpm --filter @booking/shared-utils build && cd apps/web && npx next build`
**Environment Variable:** `NEXT_PUBLIC_DEMO_MODE=true`

---

## Project Structure

```
booking-system/
├── apps/
│   ├── api/           # NestJS backend (port 3001)
│   └── web/           # Next.js frontend (port 3002)
├── packages/
│   ├── shared-types/
│   ├── shared-schemas/
│   ├── shared-constants/
│   └── shared-utils/
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Demo Mode

When `NEXT_PUBLIC_DEMO_MODE=true`:

- Auto-logged in as demo user
- 9 localized demo services (Metro Manila providers, PHP prices)
- Shareable provider profile pages (`/p/glow-up-studio`)
- Week-view slot grid for availability
- Cancellation reason tracking + no-show metrics
- Booking source attribution
- Floating toggle for Customer / Provider views

## API Documentation

Start the API, then visit: http://localhost:3001/api-docs
