<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# A3b: Booking Engine (CQRS)

**Plan:** Backend
**Depends on:** A3a-availability
**Verify before starting:** `curl -s http://localhost:3001/v1/availability/slots?service_id=...&start_date=2026-03-26&end_date=2026-03-26` → expected: 200 with slots array
**BRs covered:** BR-004, BR-005, BR-006, BR-008, BR-009, BR-013, BR-020
**Estimated tasks:** 5

---

## Tasks

### A3b.1: Booking Module + CQRS Setup

**Type:** module
**Files:**
- `apps/api/src/modules/booking/booking.module.ts` — create
- `apps/api/src/modules/booking/booking.entity.ts` — create
- `apps/api/src/modules/booking/booking.controller.ts` — create

**Implementation:**
Install `@nestjs/cqrs`. Booking entity per data model. Controller routes to command/query bus. Endpoints: `POST /v1/bookings` (public, rate-limited 20/60s), `GET /v1/bookings/:id`, `GET /v1/bookings`, `PATCH /v1/bookings/:id/cancel`, `PATCH /v1/bookings/:id/reschedule`.

**AC:**
- [ ] Module registers with CQRS
- [ ] All 5 endpoints mapped

---

### A3b.2: Create Booking Command

**Type:** command
**Files:**
- `apps/api/src/modules/booking/commands/create-booking.command.ts` — create
- `apps/api/src/modules/booking/commands/create-booking.handler.ts` — create

**Implementation:**
1. Check idempotency key — return existing if found (BR-020). 2. Load service for providerId + duration. 3. findOrCreateByEmail for guest customer (BR-005). 4. INSERT booking — DB EXCLUDE constraint prevents double-booking (BR-006). 5. Catch constraint violation 23P01 → throw ConflictException. 6. Emit BookingConfirmedEvent. 7. Invalidate availability cache.

**AC:**
- [ ] Booking created successfully
- [ ] Duplicate idempotency key returns original booking
- [ ] Concurrent booking for same slot → one succeeds, one gets 409

---

### A3b.3: Cancel Booking Command

**Type:** command
**Files:**
- `apps/api/src/modules/booking/commands/cancel-booking.handler.ts` — create

**Implementation:**
Verify auth: owner OR provider OR valid HMAC token (BR-008, BR-013). Check cancellation policy deadline (BR-009). Update status → 'cancelled' with optimistic lock. Emit BookingCancelledEvent. Invalidate cache.

**AC:**
- [ ] Owner can cancel via auth
- [ ] Token-based cancel works without login
- [ ] Cancellation policy fee calculated if past deadline

---

### A3b.4: Reschedule Booking Command

**Type:** command
**Files:**
- `apps/api/src/modules/booking/commands/reschedule-booking.handler.ts` — create

**Implementation:**
Transaction: cancel old (status → 'rescheduled') + create new with same customer context (BR-008). Auth: owner OR provider OR token. New slot validated via availability engine. Emit BookingRescheduledEvent.

**AC:**
- [ ] Old booking rescheduled, new booking confirmed
- [ ] Customer notes/preferences preserved
- [ ] New slot conflict → 409

---

### A3b.5: Booking Action Tokens

**Type:** service
**Files:**
- `apps/api/src/modules/booking/booking-token.service.ts` — create

**Implementation:**
`generateToken(bookingId, action)` — HMAC-SHA256 with app secret. Payload: `{ bookingId, action, exp: 7days }`. `validateToken(token)` — verify signature + expiry. Embedded in cancel/reschedule email links. Per BR-008.

**AC:**
- [ ] Token generates and validates correctly
- [ ] Expired token rejected
- [ ] Tampered token rejected

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Full booking lifecycle: create → view → cancel/reschedule
- [ ] Double-booking prevented at DB level under concurrent load
- [ ] Token-based cancel/reschedule works
- [ ] Ready for A4
