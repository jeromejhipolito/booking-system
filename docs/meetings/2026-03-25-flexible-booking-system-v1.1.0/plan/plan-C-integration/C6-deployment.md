<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# C6: Deployment & Launch

**Plan:** Integration
**Depends on:** C5-security-e2e
**Verify before starting:** E2E passes, load test passes, IDOR clean
**BRs covered:** BR-006, BR-011, BR-032, BR-033
**Estimated tasks:** 4

---

## Tasks

### C6.1: Production Docker
**Type:** config
**Files:** apps/api/Dockerfile, apps/web/Dockerfile, docker-compose.prod.yml
**Implementation:** Multi-stage builds. TLS enforced.
**AC:**
- [ ] Prod compose starts all services
- [ ] Migrations run on startup

### C6.2: Environment Validation
**Type:** config
**Files:** apps/api/src/config/env.validation.ts
**Implementation:** Zod validates required env vars at startup. Missing → crash with clear list.
**AC:**
- [ ] Missing JWT_SECRET → clear error
- [ ] All present → starts normally

### C6.3: Health Check + Monitoring
**Type:** endpoint
**Files:** health/health.controller.ts
**Implementation:** GET /v1/health: DB + Redis status. Sentry errors. JSON logging.
**AC:**
- [ ] 200 when healthy, 503 when DB down

### C6.4: Launch Checklist
**Type:** verification
**Files:** docs/launch-checklist.md
**Implementation:** All 18 MUST BRs verified. Onboarding <5min. Swagger at /api-docs (BR-032). README exists (BR-033). No test creds in prod.
**AC:**
- [ ] All 18 MUST BRs pass
- [ ] Swagger accessible
- [ ] Launch checklist 100%

---

## Phase Checklist
- [ ] Production ready
- [ ] READY FOR LAUNCH
