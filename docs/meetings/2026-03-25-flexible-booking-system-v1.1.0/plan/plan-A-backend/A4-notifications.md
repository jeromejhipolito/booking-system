<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# A4: Async Notifications, Events & WebSocket

**Plan:** Backend
**Depends on:** A3b-booking
**Verify before starting:** `curl POST /v1/bookings` → 201, `curl PATCH cancel` → 200
**BRs covered:** BR-003, BR-007, BR-008, BR-015, BR-016, BR-018, BR-019, BR-030
**Estimated tasks:** 5

---

## Tasks

### A4.1: Transactional Outbox + Async Processor
**Type:** service
**Files:** apps/api/src/modules/notification/outbox-processor.service.ts
**Implementation:** Cron 5s: SELECT FOR UPDATE SKIP LOCKED. Events written in booking TX. Booking response MUST NOT block on delivery (BR-030). Route by event_type.
**AC:**
- [ ] Events processed within 5 seconds
- [ ] Booking POST returns before email/SMS is sent (async)

### A4.2: Email + SMS Channels
**Type:** service
**Files:** channels/email.service.ts, channels/sms.service.ts
**Implementation:** SendGrid/SMTP + Twilio. Templates: confirmed, cancelled, rescheduled, reminder. Includes token links (BR-008). Under 60s delivery (BR-007).
**AC:**
- [ ] Confirmation email sent asynchronously
- [ ] Email includes cancel/reschedule token links

### A4.3: Calendar .ics Generation
**Type:** service
**Files:** channels/calendar.service.ts
**Implementation:** ical-generator. Google deep link. Apple webcal://. Per BR-015.
**AC:**
- [ ] .ics downloads with correct data
- [ ] Google Calendar link works

### A4.4: Reminder Scheduler
**Type:** scheduler
**Files:** scheduler/reminder-scheduler.service.ts
**Implementation:** Cron hourly. 24h + 2h reminders (BR-016). Pre-appointment info (BR-018). Post-service review (BR-019).
**AC:**
- [ ] Reminders created for tomorrow's bookings

### A4.5: WebSocket Availability Gateway
**Type:** gateway
**Files:** availability.gateway.ts
**Implementation:** Socket.io /availability. Broadcast on booking create/cancel. Per BR-003.
**AC:**
- [ ] Broadcast on booking change

---

## Phase Checklist
- [ ] Async dispatch verified, channels work, WebSocket broadcasts
- [ ] Ready for A5
