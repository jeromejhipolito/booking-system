<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# C5: Security Hardening + E2E Testing

**Plan:** Integration
**Depends on:** C4-realtime-notifications
**Verify before starting:** Notifications + WebSocket verified → confirmed
**BRs covered:** BR-006, BR-012, BR-013
**Estimated tasks:** 5

---

## Tasks

### C5.1: IDOR Audit on All Mutation Endpoints

**Type:** security
**Files:**
- No new files — test existing endpoints

**Implementation:**
For each mutation endpoint: create User A's booking, attempt cancel/reschedule/update with User B's JWT. Verify 403 Forbidden. Test: `PATCH /bookings/:id/cancel`, `PATCH /bookings/:id/reschedule`, `PATCH /services/:id`, `PATCH /providers/:id`, `PATCH /availability/:id`. Per BR-013.

**AC:**
- [ ] User B cannot cancel User A's booking → 403
- [ ] User B cannot reschedule User A's booking → 403
- [ ] User B cannot update User A's service → 403
- [ ] Admin can access all resources
- [ ] Token-based access still works for cancel/reschedule

---

### C5.2: Rate Limiting Verification

**Type:** security
**Files:**
- No new files — test existing throttle config

**Implementation:**
Verify: auth endpoints limited to 5 req/60s. Booking creation limited to 20 req/60s. 6th auth request within 60s → 429 Too Many Requests.

**AC:**
- [ ] 6th login attempt in 60s returns 429
- [ ] 21st booking attempt in 60s returns 429
- [ ] Rate limit resets after TTL

---

### C5.3: Input Validation Hardening

**Type:** security
**Files:**
- No new files — test existing validation

**Implementation:**
Verify global ValidationPipe: whitelist + forbidNonWhitelisted. Send extra fields → rejected. Send missing required fields → 400. Send invalid types → 400. XSS payloads in notes field → sanitized or rejected.

**AC:**
- [ ] Extra fields stripped from request body
- [ ] Missing required fields return descriptive 400 error
- [ ] Invalid email format rejected
- [ ] Script tags in notes field not executed

---

### C5.4: Load Test — Double-Booking Prevention

**Type:** performance
**Files:**
- `tests/load/concurrent-booking.sh` — create

**Implementation:**
50 concurrent POST /v1/bookings for the same time slot (same provider). Verify: exactly 1 succeeds with 201, all others get 409. Per BR-006: tested at 50x peak load.

**AC:**
- [ ] 50 concurrent requests → exactly 1 booking created
- [ ] 49 requests receive 409 Conflict
- [ ] No phantom bookings in database
- [ ] Response time P95 under 500ms

---

### C5.5: E2E Test — Full Booking Flow

**Type:** e2e
**Files:**
- `tests/e2e/booking-flow.spec.ts` — create (Playwright)

**Implementation:**
Playwright test: open /services → click service card → select staff → pick date → pick slot → fill guest form → confirm → verify confirmation page → click cancel link → verify cancelled. Test on desktop (1280px) and mobile (375px).

**AC:**
- [ ] Full happy path passes on desktop
- [ ] Full happy path passes on mobile
- [ ] Cancel from confirmation page works
- [ ] Test completes in under 30 seconds

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Zero IDOR vulnerabilities found
- [ ] Rate limiting active and verified
- [ ] Input validation rejects invalid data
- [ ] Double-booking prevention holds under 50x concurrent load
- [ ] E2E test passes on desktop + mobile
- [ ] Ready for C6
