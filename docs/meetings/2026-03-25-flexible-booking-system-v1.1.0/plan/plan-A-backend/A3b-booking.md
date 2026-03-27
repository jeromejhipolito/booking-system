<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# A3b: Booking Engine (CQRS)

**Plan:** Backend
**Depends on:** A3a-availability
**Verify before starting:** `curl GET /v1/availability/slots?...` → 200 with slots
**BRs covered:** BR-004, BR-005, BR-006, BR-008, BR-009, BR-013, BR-020, BR-038
**Estimated tasks:** 5

---

## Tasks

### A3b.1: Booking Module + CQRS
**Type:** module
**Files:** apps/api/src/modules/booking/ (module, entity, controller)
**Implementation:** @nestjs/cqrs. 5 endpoints. Rate limit 20/60s on POST. Human error messages (BR-038): "This time slot is no longer available", "You can only cancel your own bookings".
**AC:**
- [ ] All 5 endpoints mapped
- [ ] Error messages are human-readable

### A3b.2: Create Booking Command
**Type:** command handler
**Files:** commands/create-booking.handler.ts
**Implementation:** Idempotency (BR-020). Guest findOrCreateByEmail (BR-005). DB constraint catch 23P01 → "Slot no longer available" (BR-006, BR-038). Emit event.
**AC:**
- [ ] Duplicate idempotency key returns original
- [ ] Concurrent same-slot → one 201, rest 409 with human message

### A3b.3: Cancel Booking Command
**Type:** command handler
**Files:** commands/cancel-booking.handler.ts
**Implementation:** Auth: owner OR provider OR HMAC token (BR-008, BR-013). Non-owner → "You can only cancel your own bookings" (BR-038). Check cancel deadline (BR-009).
**AC:**
- [ ] Owner cancels via auth
- [ ] Token cancels without login
- [ ] Non-owner gets 403 with human message

### A3b.4: Reschedule Booking Command
**Type:** command handler
**Files:** commands/reschedule-booking.handler.ts
**Implementation:** Transaction: cancel old + create new preserving context (BR-008).
**AC:**
- [ ] Old rescheduled, new confirmed
- [ ] Customer notes preserved

### A3b.5: Booking Action Tokens
**Type:** service
**Files:** booking-token.service.ts
**Implementation:** HMAC-SHA256, 7-day expiry. Per BR-008.
**AC:**
- [ ] Token generates and validates
- [ ] Expired/tampered rejected

---

## Phase Checklist
- [ ] Full lifecycle, double-booking prevented, human error messages
- [ ] Ready for A4
