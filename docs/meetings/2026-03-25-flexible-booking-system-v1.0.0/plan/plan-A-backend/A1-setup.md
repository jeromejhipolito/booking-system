<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# A1: Backend Project Setup

**Plan:** Backend
**Depends on:** none
**Verify before starting:** `node --version` → expected: v20+
**BRs covered:** BR-006, BR-012, BR-014
**Estimated tasks:** 5

---

## Tasks

### A1.1: Scaffold NestJS + Turborepo Monorepo

**Type:** scaffolding
**Files:**
- `package.json` — create: root workspace config
- `turbo.json` — create: Turborepo pipeline config
- `apps/api/` — create: NestJS app via `nest new`
- `packages/shared-types/` — create: shared TypeScript interfaces
- `packages/shared-schemas/` — create: shared Zod validation schemas
- `packages/shared-constants/` — create: business rule constants

**Implementation:**
Initialize Turborepo workspace. Scaffold NestJS app in `apps/api/`. Create shared packages with path aliases in `tsconfig.base.json`. Install core deps: `@nestjs/common`, `@nestjs/config`, `@nestjs/typeorm`, `pg`, `zod`, `bcryptjs`, `helmet`.

**AC:**
- [ ] `pnpm install` succeeds
- [ ] `cd apps/api && npx nest build` compiles without errors
- [ ] Shared packages importable from API app

---

### A1.2: Docker Compose + PostgreSQL + Redis

**Type:** config
**Files:**
- `docker-compose.yml` — create: Postgres 16 + Redis 7

**Implementation:**
Postgres on :5432 (booking_system db), Redis on :6379. Health checks. Named volumes.

**AC:**
- [ ] `docker compose up -d` starts both services
- [ ] `pg_isready` returns accepting connections

---

### A1.3: Database Migration — Core Schema

**Type:** migration
**Files:**
- `apps/api/src/database/migrations/001-initial-schema.sql` — create

**Implementation:**
Enable `btree_gist` extension. Create enums: `user_role`, `service_type`, `booking_status`. Create tables: `users`, `refresh_tokens`, `providers`, `customers`, `services`, `availability_rules`, `bookings` (with `EXCLUDE USING gist` on tstzrange), `outbox_events`. Add indexes per data model in BRs.

**AC:**
- [ ] Migration runs without errors
- [ ] `\dt` shows all 8 tables
- [ ] `EXCLUDE USING gist` constraint exists on bookings table

---

### A1.4: Shared Types + Zod Schemas

**Type:** library
**Files:**
- `packages/shared-types/src/index.ts` — create: all interfaces/enums from BR data model
- `packages/shared-schemas/src/index.ts` — create: Zod schemas for service, booking, availability, auth
- `packages/shared-constants/src/index.ts` — create: defaults, rate limits, cache TTLs

**Implementation:**
Define `ServiceType`, `BookingStatus`, `UserRole` enums. Interfaces for `IService`, `IBooking`, `IProvider`, `ICustomer`, `IAvailabilityRule`, `ITimeSlot`. Zod schemas: `createBookingSchema`, `createServiceSchema`, `registerSchema`, `loginSchema`. Constants: `PROVIDER_DEFAULTS`, `AUTH`, `RATE_LIMITS`, `CACHE`.

**AC:**
- [ ] Types compile and export from shared package
- [ ] Zod schemas validate correct data and reject invalid data

---

### A1.5: Timezone Utilities

**Type:** library
**Files:**
- `packages/shared-utils/src/timezone.ts` — create: UTC conversion, display formatting, mismatch detection

**Implementation:**
`toUTC(date, iana)`, `fromUTC(utc, iana)`, `detectUserTimezone()`, `formatSlotDisplay(start, end, userTz, providerTz)`, `isTimezoneMismatch(userTz, providerTz)`. Use `date-fns-tz`. Per BR-014: all times stored UTC with IANA string.

**AC:**
- [ ] `toUTC` + `fromUTC` round-trips correctly for US/EU timezones
- [ ] `formatSlotDisplay` returns both provider and user time strings
- [ ] DST transition edge cases pass

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] `npx nest build` compiles
- [ ] Docker services running
- [ ] Database migrated with all tables
- [ ] Shared packages importable
- [ ] Ready for A2
