<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# A3a: Availability Engine

**Plan:** Backend
**Depends on:** A2-auth-models
**Verify before starting:** `curl POST /v1/auth/register` → 201, `curl GET /v1/services` → 200
**BRs covered:** BR-002, BR-003, BR-014
**Estimated tasks:** 4

---

## Tasks

### A3a.1: Availability Rule Entity + CRUD
**Type:** module
**Files:** apps/api/src/modules/availability/ (entity, service, controller, module)
**Implementation:** AvailabilityRule: rrule (RFC 5545), timezone (IANA), exceptions (JSONB). CRUD for provider. POST /:id/exceptions. Per BR-002.
**AC:**
- [ ] Provider creates rule with RRULE string
- [ ] Exception dates block days

### A3a.2: Slot Expansion Service
**Type:** service
**Files:** apps/api/src/modules/availability/slot-expansion.service.ts
**Implementation:** Install rrule. Load rules → expand RRULE → apply exceptions → split by duration+buffer → remove occupied (query bookings) → filter minAdvanceHours. All UTC. Per BR-002, BR-003, BR-014.
**AC:**
- [ ] RRULE expands into correct slots
- [ ] Occupied slots excluded
- [ ] Buffer time respected

### A3a.3: Availability API Endpoint
**Type:** controller
**Files:** availability.controller.ts (modify: add slots endpoint)
**Implementation:** GET /v1/availability/slots?service_id&start_date&end_date. Public. Returns IAvailabilityResponse with timezone info. Max 14 days.
**AC:**
- [ ] Returns available slots for date range
- [ ] Empty array for fully-booked dates

### A3a.4: Redis Cache
**Type:** cache
**Files:** availability.service.ts (modify)
**Implementation:** Cache: availability:{providerId}:{date}. TTL 60s. Invalidate on booking/rule change. Per BR-003.
**AC:**
- [ ] Cached on second request
- [ ] Invalidates on booking change

---

## Phase Checklist
- [ ] Slot expansion correct, cache works
- [ ] Ready for A3b
