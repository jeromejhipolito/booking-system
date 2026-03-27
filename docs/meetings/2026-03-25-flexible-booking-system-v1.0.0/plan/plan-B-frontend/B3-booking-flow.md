<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# B3: Booking Wizard (3-Step Flow)

**Plan:** Frontend
**Depends on:** B2-public-pages
**Verify before starting:** `/services` page renders with working search/filter → confirmed
**BRs covered:** BR-003, BR-004, BR-005, BR-009, BR-014, BR-015
**Estimated tasks:** 6

---

## Tasks

### B3.1: Booking Store (Zustand) + URL State (nuqs)

**Type:** state
**Files:**
- `apps/web/stores/booking-store.ts` — create
- Install: `zustand`, `nuqs`

**Implementation:**
Zustand store: selectedService, selectedStaffId, selectedDate, selectedSlot, customerInfo, currentStep, leaseId. URL params synced via nuqs: `?service={id}&staff={id}&step=2&date=2026-03-26`. Bookmarkable, shareable, back-button safe. Reset on completion.

**AC:**
- [ ] Store state persists across step navigation
- [ ] URL params update on each step change
- [ ] Direct URL access restores correct step
- [ ] Back button returns to previous step without data loss

---

### B3.2: Step 1 — Service + Staff Selection

**Type:** page
**Files:**
- `apps/web/app/(booking)/book/page.tsx` — create
- `apps/web/components/booking/steps/service-step.tsx` — create

**Implementation:**
Per wireframe Screen 2. Show selected service card (name, price, duration, rating, cancellation policy). Staff selector: cards with photo placeholder, name, rating, next available. "No Preference" option. Step indicator (3 circles). Continue button disabled until service loaded.

**AC:**
- [ ] Service card displays from mock data
- [ ] Staff card selection: blue border + checkmark on selected
- [ ] "No Preference" selectable and visually distinct
- [ ] Step indicator shows step 1 active
- [ ] Continue button enabled after selection

---

### B3.3: Step 2 — Date & Time Selection

**Type:** component
**Files:**
- `apps/web/components/booking/steps/date-time-step.tsx` — create
- `apps/web/components/calendar/time-slot-picker.tsx` — create

**Implementation:**
Per wireframe Screen 3. Week view: 7-day row, arrows to navigate weeks. Date cell click loads mock slots. Slots grouped: Morning/Afternoon/Evening. Slot chips: 44px min height. Selected = blue bg. Fixed `grid-template-rows: repeat(6, 48px)` prevents CLS. Timezone warning if user TZ differs from provider TZ (BR-014). Mobile: horizontal scrollable date strip + vertical slot list.

**AC:**
- [ ] Week navigation arrows shift dates
- [ ] Date click shows slots (skeleton 500ms then mock slots)
- [ ] Slot chip selection: blue bg + white text
- [ ] Unavailable slots: gray + strikethrough (non-clickable)
- [ ] Timezone mismatch warning shown (yellow alert)
- [ ] Empty state: "No availability this week"
- [ ] Mobile: horizontal date strip works with touch scroll

---

### B3.4: Step 3 — Confirmation + Guest Form

**Type:** component
**Files:**
- `apps/web/components/booking/steps/confirmation-step.tsx` — create

**Implementation:**
Per wireframe Screen 4. Booking summary card (service, staff, date/time with both TZs, price). Cancellation policy visible (BR-009). Guest form: name, email, phone (required), notes (optional). Validate on blur with Zod schema. Optional "create account" checkbox. Confirm button: disabled during submit, spinner + "Confirming..." text.

**AC:**
- [ ] Summary shows both provider and user timezone
- [ ] Cancellation policy text visible before confirm
- [ ] Form validates on blur: red border + inline error
- [ ] Submit button shows spinner (simulated 1s delay with mock)
- [ ] Success redirects to confirmation page

---

### B3.5: Post-Booking Confirmation Page

**Type:** page
**Files:**
- `apps/web/app/(booking)/book/confirmed/page.tsx` — create

**Implementation:**
Per wireframe Screen 5. Success checkmark. Booking summary. Calendar integration buttons: Google Calendar link, Apple Calendar link, .ics download (all mock URLs for now). "What to Expect" section. Reschedule + Cancel buttons (link to mock routes). Booking ref number. "Confirmation sent to: email + phone".

**AC:**
- [ ] Success animation/checkmark renders
- [ ] All 3 calendar buttons present and styled
- [ ] Reschedule/Cancel buttons navigate to correct routes
- [ ] Booking reference displayed

---

### B3.6: Booking Wizard Stepper Component

**Type:** component
**Files:**
- `apps/web/components/booking/booking-wizard.tsx` — create

**Implementation:**
3-step stepper: circles connected by lines. Active = blue filled. Completed = green filled + checkmark. Future = gray outline. Renders current step component. Back button on steps 2-3. Smooth transition between steps.

**AC:**
- [ ] Stepper shows correct state per step
- [ ] Completed steps show green checkmark
- [ ] Transition between steps is smooth (not instant swap)

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Full booking flow works: catalog → step 1 → step 2 → step 3 → confirmed
- [ ] URL state preserved (bookmarkable, back-button safe)
- [ ] All loading/empty/error states implemented
- [ ] Form validation with inline errors
- [ ] Timezone warning displays correctly
- [ ] Mobile responsive on all 3 steps
- [ ] Ready for B4
