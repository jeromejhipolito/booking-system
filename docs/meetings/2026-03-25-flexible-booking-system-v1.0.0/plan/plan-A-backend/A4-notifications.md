<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# A4: Notifications, Events & WebSocket

**Plan:** Backend
**Depends on:** A3b-booking-engine
**Verify before starting:** `curl -s -X POST http://localhost:3001/v1/bookings -H "Content-Type: application/json" -d '...'` → expected: 201 booking created
**BRs covered:** BR-003, BR-007, BR-008, BR-015, BR-016, BR-018, BR-019
**Estimated tasks:** 5

---

## Tasks

### A4.1: Transactional Outbox + Processor

**Type:** service
**Files:**
- `apps/api/src/modules/notification/outbox-processor.service.ts` — create

**Implementation:**
Cron every 5s: `SELECT FROM outbox_events WHERE processed = false ORDER BY created_at LIMIT 10 FOR UPDATE SKIP LOCKED`. Route by event_type to handler. Mark processed. Events written in same transaction as booking mutations.

**AC:**
- [ ] Outbox events processed within 5 seconds
- [ ] Duplicate processing prevented via SKIP LOCKED
- [ ] Events survive app restart

---

### A4.2: Email + SMS Notification Channels

**Type:** service
**Files:**
- `apps/api/src/modules/notification/channels/email.service.ts` — create
- `apps/api/src/modules/notification/channels/sms.service.ts` — create

**Implementation:**
Email via SendGrid (or SMTP for dev). SMS via Twilio. Templates: booking-confirmed, booking-cancelled, booking-rescheduled, reminder, review-request. Confirmation includes cancel/reschedule token links (BR-008). Delivered within 3 seconds (BR-007).

**AC:**
- [ ] Confirmation email sent on booking creation
- [ ] Confirmation SMS sent on booking creation
- [ ] Email includes cancel + reschedule token links

---

### A4.3: Calendar Integration (.ics)

**Type:** service
**Files:**
- `apps/api/src/modules/notification/channels/calendar.service.ts` — create

**Implementation:**
Use `ical-generator`. Generate .ics with event title, start/end (timezone-aware), location, description, organizer. Provide: .ics download URL, Google Calendar deep link, Apple Calendar webcal:// link. Per BR-015.

**AC:**
- [ ] .ics file downloads with correct event data
- [ ] Google Calendar link opens pre-filled event
- [ ] Timezone correct in generated .ics

---

### A4.4: Reminder Scheduler

**Type:** scheduler
**Files:**
- `apps/api/src/modules/notification/scheduler/reminder-scheduler.service.ts` — create

**Implementation:**
Cron hourly: find bookings with slot_start in next 25h, check provider's reminderSettings, create outbox events for due reminders. Types: 24h reminder, 2h reminder, pre-appointment info (BR-018), post-service review (BR-019 — 2h after end). Per BR-016.

**AC:**
- [ ] 24h reminder created for tomorrow's bookings
- [ ] 2h reminder created for bookings in next 3h
- [ ] Provider-configurable timing respected

---

### A4.5: WebSocket Availability Gateway

**Type:** gateway
**Files:**
- `apps/api/src/modules/availability/availability.gateway.ts` — create

**Implementation:**
Socket.io namespace `/availability`. Clients subscribe to `availability:{serviceId}:{date}`. On booking create/cancel, broadcast updated slots to room. Enables real-time slot updates per BR-003.

**AC:**
- [ ] Client subscribes and receives initial slots
- [ ] Slot update broadcast on booking creation
- [ ] Slot update broadcast on booking cancellation

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Full notification flow: booking → outbox → email + SMS within 3s
- [ ] Calendar links work
- [ ] Reminders schedule correctly
- [ ] WebSocket pushes availability changes
- [ ] Ready for Plan C integration
