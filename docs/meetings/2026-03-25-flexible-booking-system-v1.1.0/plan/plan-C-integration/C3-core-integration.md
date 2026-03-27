<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# C3: Core Flow Integration

**Plan:** Integration
**Depends on:** C2-api-wiring
**Verify before starting:** Catalog loads real data + auth works
**BRs covered:** BR-003, BR-004, BR-006, BR-007, BR-008, BR-010, BR-011, BR-017
**Estimated tasks:** 5

---

## Tasks

### C3.1: Wire Booking Wizard
**Type:** integration
**Files:** steps/date-time-step.tsx, steps/confirmation-step.tsx
**Implementation:** Real availability API for slots. Real POST /bookings with idempotency. 409 → human message. Redirect to confirmed.
**AC:**
- [ ] Real slots from API
- [ ] Booking creates real DB record
- [ ] Double-booking → "Slot no longer available"

### C3.2: Wire Cancel/Reschedule
**Type:** integration
**Files:** cancel/[id]/page.tsx, reschedule/[id]/page.tsx
**Implementation:** Real PATCH with token support. No login needed.
**AC:**
- [ ] Token cancel works
- [ ] Cancelled slot freed

### C3.3: Wire Provider Dashboard
**Type:** integration
**Files:** (provider)/dashboard/page.tsx
**Implementation:** Real GET /bookings with auth. Stats from real data.
**AC:**
- [ ] Real bookings displayed
- [ ] Empty state when none

### C3.4: Wire Provider Onboarding
**Type:** integration
**Files:** (provider)/onboarding/page.tsx
**Implementation:** Real POST /providers, /services, /availability. Sequential.
**AC:**
- [ ] Real records in DB
- [ ] Under 5 minutes

### C3.5: Wire Customer Dashboard
**Type:** integration
**Files:** (dashboard)/page.tsx
**Implementation:** Real GET /bookings for customer.
**AC:**
- [ ] Real bookings with reschedule/cancel links

---

## Phase Checklist
- [ ] Full booking E2E with real DB
- [ ] Ready for C4
