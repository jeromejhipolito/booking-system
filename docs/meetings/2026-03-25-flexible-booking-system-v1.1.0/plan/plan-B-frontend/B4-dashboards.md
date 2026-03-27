<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# B4: Dashboards + Booking Management

**Plan:** Frontend
**Depends on:** B3-booking-flow
**Verify before starting:** Full booking wizard works E2E with mock data
**BRs covered:** BR-008, BR-010, BR-011, BR-017, BR-036, BR-038
**Estimated tasks:** 6

---

## Tasks

### B4.1: Provider Dashboard ('use client')
**Type:** page
**Files:** app/(provider)/dashboard/page.tsx, app/(provider)/layout.tsx
**Implementation:** Sidebar with usePathname active. Stats skeleton → mock. Agenda with expand-on-click. Empty state.
**AC:**
- [ ] 'use client' + usePathname for sidebar active
- [ ] isLoading → skeleton stats
- [ ] Empty: "No appointments today"
- [ ] Booking rows expandable

### B4.2: Provider Onboarding ('use client')
**Type:** page
**Files:** app/(provider)/onboarding/page.tsx
**Implementation:** 3-step: business+tz → service+duration+price → weekly schedule. Defaults pre-filled. Duration chips via state.
**AC:**
- [ ] 'use client' + useState for all fields + currentStep
- [ ] TZ auto-detected
- [ ] Duration chips: selected via state
- [ ] Day toggles work
- [ ] Under 5 minutes (timed)

### B4.3: Customer Dashboard ('use client')
**Type:** page
**Files:** app/(dashboard)/page.tsx
**Implementation:** Upcoming/past bookings. Reschedule/cancel buttons. "Book Again". Empty state. Loading skeleton.
**AC:**
- [ ] 'use client' + isLoading → skeleton
- [ ] Empty: "No bookings yet"
- [ ] "Book Again" links to /book?service={id}

### B4.4: Reschedule Page ('use client')
**Type:** page
**Files:** app/(booking)/reschedule/[id]/page.tsx
**Implementation:** No login (token URL). Current booking. Slot picker reuse. Confirm. Error messages human (BR-038).
**AC:**
- [ ] 'use client', loads without login
- [ ] Slot picker works
- [ ] Errors: human messages not codes

### B4.5: Cancel Page ('use client')
**Type:** page
**Files:** app/(booking)/cancel/[id]/page.tsx
**Implementation:** No login. Cancel policy. Confirm. Success with rebook. Human errors (BR-038).
**AC:**
- [ ] 'use client', cancel policy displayed
- [ ] Success → "Book Again" option

### B4.6: Event Tracking Instrumentation
**Type:** utility
**Files:** lib/analytics.ts
**Implementation:** trackEvent(eventName, properties) function. Events: service.searched, service.viewed, booking.step_completed, booking.created, booking.cancelled. No PII. Per BR-036. Console.log in dev, ready for real analytics in integration.
**AC:**
- [ ] trackEvent calls on search, service click, each booking step, confirm, cancel
- [ ] No PII in event properties

---

## Phase Checklist
- [ ] Dashboards with active nav, skeletons, empty states
- [ ] Event tracking instrumented
- [ ] Frontend Plan B complete
