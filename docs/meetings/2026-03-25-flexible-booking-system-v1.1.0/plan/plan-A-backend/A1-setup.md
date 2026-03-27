<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# A1: Backend Project Setup

**Plan:** Backend
**Depends on:** none
**Verify before starting:** `node --version` → v20+, `docker --version` → exists
**BRs covered:** BR-006, BR-012, BR-014, BR-031, BR-033
**Estimated tasks:** 6

---

## Tasks

### A1.1: Scaffold Turborepo + NestJS
**Type:** scaffolding
**Files:** package.json, pnpm-workspace.yaml, turbo.json, apps/api/
**Implementation:** Turborepo workspace. NestJS in apps/api/. Shared packages: shared-types, shared-schemas, shared-constants, shared-utils. Core deps.
**AC:**
- [ ] `pnpm install` succeeds
- [ ] `npx nest build` compiles

### A1.2: Docker Compose
**Type:** config
**Files:** docker-compose.yml
**Implementation:** Postgres 16 :5432, Redis 7 :6379, health checks, volumes.
**AC:**
- [ ] `docker compose up -d` starts both
- [ ] `pg_isready` returns accepting

### A1.3: Database Migration
**Type:** migration
**Files:** apps/api/src/database/migrations/001-initial-schema.sql
**Implementation:** btree_gist, enums, 8 tables (users, refresh_tokens, providers, customers, services, availability_rules, bookings with EXCLUDE USING gist, outbox_events), indexes. Per BR-006.
**AC:**
- [ ] 8 tables created
- [ ] Booking exclusion constraint exists

### A1.4: Shared Types + Zod Schemas + Constants
**Type:** library
**Files:** packages/shared-types/src/index.ts, packages/shared-schemas/src/index.ts, packages/shared-constants/src/index.ts
**Implementation:** Enums, interfaces, Zod schemas, default constants. Includes pagination types (BR-031).
**AC:**
- [ ] Types compile and export
- [ ] Zod validates/rejects correctly

### A1.5: Timezone Utilities
**Type:** library
**Files:** packages/shared-utils/src/timezone.ts
**Implementation:** toUTC, fromUTC, detectUserTimezone, formatSlotDisplay, isTimezoneMismatch. Per BR-014.
**AC:**
- [ ] Round-trip works for US/EU timezones

### A1.6: Developer README
**Type:** docs
**Files:** README.md
**Implementation:** Setup guide: prerequisites, pnpm install, Docker up, migration, env vars, run API, run frontend, seed data. Per BR-033.
**AC:**
- [ ] New developer can set up from README in under 10 minutes

---

## Phase Checklist
- [ ] NestJS builds, Docker runs, DB migrated, shared packages work, README exists
- [ ] Ready for A2
