<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# C4: Real-Time Updates + Notification Verification

**Plan:** Integration
**Depends on:** C3-core-integration
**Verify before starting:** Full booking + cancel flow works with real DB → confirmed
**BRs covered:** BR-003, BR-007, BR-015, BR-016
**Estimated tasks:** 4

---

## Tasks

### C4.1: WebSocket Client for Availability

**Type:** integration
**Files:**
- `apps/web/hooks/use-realtime-availability.ts` — create
- `apps/web/components/booking/steps/date-time-step.tsx` — modify: add WS subscription

**Implementation:**
Install `socket.io-client`. Connect to `/availability` namespace. Subscribe to `availability:{serviceId}:{date}`. On `availability:updated` event → update React Query cache with new slots. Fallback: if WebSocket fails, keep 60s polling.

**AC:**
- [ ] WebSocket connection established to API
- [ ] Slot updates appear within 2 seconds of another booking
- [ ] Fallback to polling if WebSocket disconnects

---

### C4.2: Verify Email Notifications End-to-End

**Type:** verification
**Files:**
- No new files — verify existing notification pipeline

**Implementation:**
Create a booking via frontend. Verify: confirmation email sent (check SendGrid logs or Mailtrap). Verify email contains: booking summary, calendar links, cancel/reschedule token links. Click cancel link from email → verify it works without login.

**AC:**
- [ ] Confirmation email received within 3 seconds
- [ ] Email contains correct booking details
- [ ] Cancel token link from email works
- [ ] Calendar links (.ics, Google) contain correct event data

---

### C4.3: Verify SMS Notifications

**Type:** verification
**Files:**
- No new files — verify existing SMS pipeline

**Implementation:**
Create a booking with real phone number (Twilio test). Verify confirmation SMS received. Verify reminder SMS scheduled (check outbox events).

**AC:**
- [ ] SMS confirmation received
- [ ] SMS contains booking summary + cancel link
- [ ] Reminder events created in outbox for future bookings

---

### C4.4: Calendar Integration Verification

**Type:** verification
**Files:**
- `apps/web/app/(booking)/book/confirmed/page.tsx` — modify: wire real calendar links

**Implementation:**
Confirmation page: Google Calendar link uses real booking data (title, start/end with timezone, location). Apple Calendar link generates webcal://. .ics download endpoint returns valid iCalendar file. Verify timezone correct in all 3 formats.

**AC:**
- [ ] Google Calendar link opens pre-filled event with correct times
- [ ] .ics file downloads and imports into calendar apps
- [ ] Timezone correct across all calendar formats

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Real-time slot updates work via WebSocket
- [ ] Email notifications delivered within 3 seconds
- [ ] SMS notifications delivered
- [ ] Calendar integration works across all 3 formats
- [ ] Ready for C5
