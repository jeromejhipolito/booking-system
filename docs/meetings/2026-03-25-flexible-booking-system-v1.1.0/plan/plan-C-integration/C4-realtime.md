<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# C4: Real-Time + Notifications + Event Tracking

**Plan:** Integration
**Depends on:** C3-core-integration
**Verify before starting:** Full booking + cancel works with real DB
**BRs covered:** BR-003, BR-007, BR-015, BR-016, BR-036
**Estimated tasks:** 4

---

## Tasks

### C4.1: WebSocket Client
**Type:** integration
**Files:** hooks/use-realtime-availability.ts, date-time-step.tsx (modify)
**Implementation:** socket.io-client → /availability. On update → refresh React Query. Fallback: 60s polling.
**AC:**
- [ ] Slot updates within 2s
- [ ] Fallback polling if WS disconnects

### C4.2: Verify Email/SMS Delivery
**Type:** verification
**Implementation:** Create booking. Check email (SendGrid/Mailtrap). Verify token links work.
**AC:**
- [ ] Email within 60s
- [ ] Token cancel link from email works

### C4.3: Calendar Integration
**Type:** integration
**Files:** book/confirmed/page.tsx (modify)
**Implementation:** Wire real Google/Apple/.ics links from API.
**AC:**
- [ ] Google Calendar pre-fills correctly
- [ ] .ics downloads

### C4.4: Wire Event Tracking
**Type:** integration
**Files:** lib/analytics.ts (modify), booking steps (modify)
**Implementation:** Replace console.log with real analytics endpoint or segment/mixpanel stub. Events fire on: search, service click, booking steps, confirm, cancel. Per BR-036.
**AC:**
- [ ] Events fire on each booking funnel step
- [ ] No PII in payloads

---

## Phase Checklist
- [ ] Real-time, notifications, calendar, events all wired
- [ ] Ready for C5
