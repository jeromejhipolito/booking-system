<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# A3a: Availability Engine

**Plan:** Backend
**Depends on:** A2-auth-models
**Verify before starting:** `curl -s http://localhost:3001/v1/services` → expected: 200 JSON array
**BRs covered:** BR-002, BR-003, BR-014
**Estimated tasks:** 4

---

## Tasks

### A3a.1: Availability Rule Entity + CRUD

**Type:** module
**Files:**
- `apps/api/src/modules/availability/` — create: entity, service, controller

**Implementation:**
AvailabilityRule: id, providerId, rrule (RFC 5545 iCal), timezone (IANA), exceptions (JSONB array of date strings), effectiveFrom, effectiveUntil. Endpoints: `POST /v1/availability` (provider), `GET /v1/availability?provider_id` (provider), `PATCH /v1/availability/:id` (owner), `DELETE /v1/availability/:id` (owner), `POST /v1/availability/:id/exceptions` (owner). Per BR-002.

**AC:**
- [ ] Provider creates availability rule with RRULE string
- [ ] Exception dates block specific days
- [ ] Only owner can modify rules

---

### A3a.2: Slot Expansion Service

**Type:** service
**Files:**
- `apps/api/src/modules/availability/slot-expansion.service.ts` — create

**Implementation:**
Install `rrule` library. `expandSlots(providerId, serviceDurationMin, bufferMin, startDate, endDate)`: load rules → expand RRULE within date range → apply exceptions → split into duration-based slots → remove occupied slots (query bookings table) → apply business rules (minAdvanceHours, maxAdvanceDays) → return available ITimeSlot[]. All processing in UTC, response includes both UTC and local. Per BR-002, BR-003, BR-014.

**AC:**
- [ ] Expands weekly RRULE into correct daily slots
- [ ] Occupied slots (existing bookings) excluded
- [ ] Buffer time between slots respected
- [ ] Exception dates have zero slots

---

### A3a.3: Availability API Endpoint

**Type:** controller
**Files:**
- `apps/api/src/modules/availability/availability.controller.ts` — modify: add slots endpoint

**Implementation:**
`GET /v1/availability/slots?service_id={id}&start_date={date}&end_date={date}` — public endpoint. Loads service to get durationMin + provider's bufferTimeMin. Calls SlotExpansionService. Returns `IAvailabilityResponse` with providerTimezone + slots array. Max 14 days per request.

**AC:**
- [ ] Returns available slots for a date range
- [ ] Slots include UTC + local time + timezone info
- [ ] Empty array for fully-booked dates

---

### A3a.4: Redis Availability Cache

**Type:** cache
**Files:**
- `apps/api/src/modules/availability/availability.service.ts` — modify: add caching

**Implementation:**
Cache key: `availability:{providerId}:{date}`. TTL: 60 seconds. Invalidate on: booking created/cancelled, availability rule changed, exception added. Use `@nestjs/cache-manager` with `cache-manager-ioredis-yet`. Per BR-003 (slots update within 60s).

**AC:**
- [ ] Second request for same provider+date returns cached result
- [ ] Cache invalidates when booking is created
- [ ] Cache invalidates when availability rule changes

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Slot expansion returns correct slots for test RRULE
- [ ] Cache works with proper invalidation
- [ ] Ready for A3b
