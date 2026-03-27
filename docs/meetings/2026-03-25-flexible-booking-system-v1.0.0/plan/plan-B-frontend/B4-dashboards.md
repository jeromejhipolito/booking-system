<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# B4: Dashboards + Booking Management

**Plan:** Frontend
**Depends on:** B3-booking-flow
**Verify before starting:** Full booking wizard flow works end-to-end with mock data → confirmed
**BRs covered:** BR-008, BR-010, BR-011, BR-017
**Estimated tasks:** 5

---

## Tasks

### B4.1: Provider Dashboard

**Type:** page
**Files:**
- `apps/web/app/(provider)/dashboard/page.tsx` — create
- `apps/web/app/(provider)/layout.tsx` — create: sidebar layout

**Implementation:**
Per wireframe Screen 6. Sidebar: Dashboard (active), Calendar, Services, Settings. Main: Quick stats row (today's appts, week total, utilization %). Today's agenda: timeline with booking rows (time, customer, service, regular/new badge, notes preview). Buffer times as gray blocks. Available slots as green blocks. Click booking → expand with details. Quick actions: Block Time, Walk-in. All from mock data.

**AC:**
- [ ] Sidebar nav with active state (blue bg on current page)
- [ ] Stats show skeleton then mock numbers
- [ ] Agenda rows clickable → expand with customer details
- [ ] Available slots highlighted green
- [ ] Buffer times shown as gray blocks
- [ ] Block Time / Walk-in buttons present

---

### B4.2: Provider Onboarding Flow

**Type:** page
**Files:**
- `apps/web/app/(provider)/onboarding/page.tsx` — create

**Implementation:**
3-step onboarding per BR-011. Step 1: business name + timezone (auto-detected). Step 2: first service (name, duration dropdown, price). Step 3: weekly hours (visual day toggles + hour inputs, defaults Mon-Fri 9-5). All fields have sensible defaults pre-filled. "You're live!" success screen with shareable booking link.

**AC:**
- [ ] Timezone auto-detected and pre-filled
- [ ] Duration dropdown: 15/30/45/60/90/120 min presets
- [ ] Weekly schedule toggles work (enable/disable days)
- [ ] Defaults pre-filled (Mon-Fri 9am-5pm, 15min buffer)
- [ ] Completable in under 5 minutes (time tested)

---

### B4.3: Customer Dashboard

**Type:** page
**Files:**
- `apps/web/app/(dashboard)/page.tsx` — create

**Implementation:**
Per BR-017. Upcoming bookings: cards with date/time, service, provider, reschedule/cancel buttons. Past bookings: collapsible list with "Book Again" and "Leave Review" buttons. Favorites section: saved provider chips. All from mock data.

**AC:**
- [ ] Upcoming bookings show with action buttons
- [ ] Past bookings collapsible
- [ ] "Book Again" pre-fills booking wizard with same service
- [ ] Empty state: "No bookings yet. Browse services to get started."
- [ ] Loading skeleton for booking cards

---

### B4.4: Reschedule Page (Token-Based)

**Type:** page
**Files:**
- `apps/web/app/(booking)/reschedule/[id]/page.tsx` — create

**Implementation:**
Per BR-008. No login required (token from URL). Shows current booking details. Reuse TimeSlotPicker from B3.3. Confirm Reschedule button. "Cancel This Booking Instead" link below. Per wireframe: accessible from email link.

**AC:**
- [ ] Page loads without login (token in URL)
- [ ] Current booking details shown
- [ ] New time slot picker works (mock slots)
- [ ] Cancel option available below reschedule

---

### B4.5: Cancel Page (Token-Based)

**Type:** page
**Files:**
- `apps/web/app/(booking)/cancel/[id]/page.tsx` — create

**Implementation:**
Per BR-008. No login required. Shows booking details + cancellation policy reminder. "Are you sure?" confirmation. Confirm Cancellation button. On success: "Booking cancelled" with option to rebook.

**AC:**
- [ ] Page loads without login
- [ ] Cancellation policy displayed
- [ ] Confirmation required before cancel
- [ ] Success state with rebook option

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Provider dashboard shows agenda with mock data
- [ ] Provider onboarding completable in under 5 minutes
- [ ] Customer dashboard shows upcoming/past bookings
- [ ] Reschedule/cancel pages work without login (token-based)
- [ ] All loading/empty states implemented
- [ ] All active/hover states functional
- [ ] Ready for Plan C integration
