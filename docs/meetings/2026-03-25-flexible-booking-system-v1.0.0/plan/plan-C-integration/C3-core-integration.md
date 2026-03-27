<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# C3: Core Flow Integration — Booking + Dashboards

**Plan:** Integration
**Depends on:** C2-api-wiring
**Verify before starting:** Service catalog loads real data + auth works → confirmed
**BRs covered:** BR-003, BR-004, BR-006, BR-007, BR-008, BR-010, BR-011, BR-017
**Estimated tasks:** 5

---

## Tasks

### C3.1: Wire Booking Wizard to Real API

**Type:** integration
**Files:**
- `apps/web/components/booking/steps/date-time-step.tsx` — modify: use real availability API
- `apps/web/components/booking/steps/confirmation-step.tsx` — modify: POST to real bookings API
- `apps/web/hooks/use-availability.ts` — create

**Implementation:**
Step 2: `useAvailability(serviceId, startDate, endDate)` replaces mock slots. Polls every 60s (BR-003). Step 3: submit calls `POST /v1/bookings` with X-Idempotency-Key header. On 409 → "slot no longer available" + refresh slots. On success → redirect to confirmed page with real booking ID.

**AC:**
- [ ] Real available slots load from API
- [ ] Booking creates real record in database
- [ ] Double-booking attempt shows conflict error
- [ ] Idempotency key prevents duplicate submissions

---

### C3.2: Wire Cancel/Reschedule to Real API

**Type:** integration
**Files:**
- `apps/web/app/(booking)/cancel/[id]/page.tsx` — modify: call real cancel endpoint
- `apps/web/app/(booking)/reschedule/[id]/page.tsx` — modify: call real reschedule endpoint

**Implementation:**
Cancel: `PATCH /v1/bookings/:id/cancel?token={token}`. Reschedule: `PATCH /v1/bookings/:id/reschedule?token={token}` with new slot. Both work without login via token. On success → confirmation message. On error → show error.

**AC:**
- [ ] Cancel via token link works (no login)
- [ ] Reschedule via token link works (no login)
- [ ] Cancelled slot becomes available again
- [ ] Rescheduled booking preserves customer notes

---

### C3.3: Wire Provider Dashboard to Real API

**Type:** integration
**Files:**
- `apps/web/app/(provider)/dashboard/page.tsx` — modify: load real bookings
- `apps/web/hooks/use-bookings.ts` — create

**Implementation:**
`useBookings({ status: 'confirmed', date: today })` fetches provider's bookings. Agenda view populated from real data. Stats calculated from booking count. Provider must be authenticated.

**AC:**
- [ ] Dashboard shows real bookings for authenticated provider
- [ ] Stats reflect actual data
- [ ] Empty state when no bookings today

---

### C3.4: Wire Provider Onboarding to Real API

**Type:** integration
**Files:**
- `apps/web/app/(provider)/onboarding/page.tsx` — modify

**Implementation:**
Step 1: `POST /v1/providers` creates provider. Step 2: `POST /v1/services` creates first service. Step 3: `POST /v1/availability` creates RRULE from visual schedule. All in sequence. On completion → redirect to dashboard.

**AC:**
- [ ] Provider record created in database
- [ ] Service created with correct duration/price
- [ ] Availability rule saved as valid RRULE
- [ ] Full flow completable in under 5 minutes

---

### C3.5: Wire Customer Dashboard to Real API

**Type:** integration
**Files:**
- `apps/web/app/(dashboard)/page.tsx` — modify: load real bookings

**Implementation:**
`useBookings()` fetches customer's bookings (upcoming + past). Reschedule/cancel buttons link to token-based pages. "Book Again" pre-fills wizard.

**AC:**
- [ ] Upcoming bookings show with real data
- [ ] Past bookings show with rebook option
- [ ] Empty state for new customers

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Full booking flow works end-to-end with real database
- [ ] Cancel/reschedule via token links verified
- [ ] Provider onboarding creates real records
- [ ] Both dashboards load real data
- [ ] Ready for C4
