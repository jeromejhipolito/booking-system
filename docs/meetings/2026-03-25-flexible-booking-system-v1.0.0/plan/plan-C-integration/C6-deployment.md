<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# C6: Deployment & Launch Prep

**Plan:** Integration
**Depends on:** C5-security-e2e
**Verify before starting:** E2E tests pass + load test passes → confirmed
**BRs covered:** BR-011 (onboarding time), BR-006 (production DB constraints)
**Estimated tasks:** 4

---

## Tasks

### C6.1: Production Docker Configuration

**Type:** config
**Files:**
- `apps/api/Dockerfile` — create: multi-stage build
- `apps/web/Dockerfile` — create: Next.js standalone build
- `docker-compose.prod.yml` — create: production stack

**Implementation:**
API Dockerfile: build stage (nest build) → prod stage (node dist/main.js). Web Dockerfile: build (next build) → standalone output. Prod compose: API + Web + Postgres + Redis with production env vars. TLS enforced.

**AC:**
- [ ] `docker compose -f docker-compose.prod.yml up` starts all services
- [ ] API accessible on configured port
- [ ] Web accessible on configured port
- [ ] Database migrations run on startup

---

### C6.2: Environment Validation

**Type:** config
**Files:**
- `apps/api/src/config/env.validation.ts` — create

**Implementation:**
Validate all required env vars at startup using Zod. Missing vars → app crashes with clear error message listing missing vars. Required: DATABASE_*, JWT_SECRET, CORS_ORIGINS, SENDGRID_API_KEY, TWILIO_*.

**AC:**
- [ ] Missing JWT_SECRET crashes with clear error
- [ ] Missing DATABASE_HOST crashes with clear error
- [ ] All vars present → app starts normally

---

### C6.3: Health Check + Monitoring

**Type:** endpoint
**Files:**
- `apps/api/src/health/health.controller.ts` — create

**Implementation:**
`GET /v1/health` — returns 200 with: DB connection status, Redis connection status, uptime. Sentry integration for error tracking (both API and Web). Structured JSON logging with request correlation IDs.

**AC:**
- [ ] Health endpoint returns 200 when DB + Redis connected
- [ ] Health endpoint returns 503 when DB disconnected
- [ ] Errors reported to Sentry

---

### C6.4: Launch Checklist Verification

**Type:** verification
**Files:**
- `docs/launch-checklist.md` — create

**Implementation:**
Verify all launch criteria:
- All MUST-have BRs (BR-001 through BR-014) implemented and tested
- Provider onboarding completes in under 5 minutes
- Booking completion rate baseline measured
- Email + SMS delivery verified in production env
- CORS restricted to production domain
- JWT secret is production-grade (not default)
- Database migrations applied
- Monitoring + alerting active

**AC:**
- [ ] All 14 MUST-have BRs verified as working
- [ ] Launch checklist document complete with pass/fail per item
- [ ] No test/dev credentials in production config

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Production Docker builds and runs
- [ ] Env validation catches missing vars
- [ ] Health check endpoint working
- [ ] Launch checklist 100% passed
- [ ] READY FOR PRODUCTION LAUNCH
