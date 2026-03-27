<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# C5: Security Hardening + E2E Testing

**Plan:** Integration
**Depends on:** C4-realtime
**Verify before starting:** Notifications + events verified
**BRs covered:** BR-006, BR-012, BR-013, BR-031
**Estimated tasks:** 5

---

## Tasks

### C5.1: IDOR Audit
**Type:** security
**Implementation:** User A's booking → User B tries cancel/reschedule/update → verify 403.
**AC:**
- [ ] Non-owner blocked on all mutations
- [ ] Token access still works
- [ ] Admin bypasses

### C5.2: Rate Limiting
**Type:** security
**Implementation:** 6 rapid logins → verify 429. 21 bookings → verify 429.
**AC:**
- [ ] Auth throttled
- [ ] Bookings throttled

### C5.3: Input Validation
**Type:** security
**Implementation:** Extra fields stripped (whitelist). Missing fields → 400. XSS → sanitized.
**AC:**
- [ ] Extra fields not in response
- [ ] Missing → descriptive 400
- [ ] Script tags not executed

### C5.4: Load Test — Double Booking
**Type:** performance
**Files:** tests/load/concurrent-booking.sh
**Implementation:** 20 concurrent POST for same slot → exactly 1 created. DB confirms.
**AC:**
- [ ] Exactly 1 booking
- [ ] Zero phantom bookings

### C5.5: E2E Test (Playwright)
**Type:** e2e
**Files:** tests/e2e/booking-flow.spec.ts
**Implementation:** Headless: /services → card → wizard → confirm. Desktop + mobile.
**AC:**
- [ ] Happy path desktop passes
- [ ] Happy path mobile passes

---

## Phase Checklist
- [ ] Zero IDOR, rate limits active, load test passes, E2E passes
- [ ] Ready for C6
