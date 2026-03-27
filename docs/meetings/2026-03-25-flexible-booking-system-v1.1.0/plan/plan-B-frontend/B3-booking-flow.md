<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# B3: Booking Wizard (3-Step Flow)

**Plan:** Frontend
**Depends on:** B2-public-pages
**Verify before starting:** /services search+filter+sort work with mock data
**BRs covered:** BR-003, BR-004, BR-005, BR-009, BR-014, BR-015, BR-038
**Estimated tasks:** 6

---

## Tasks

### B3.1: Booking Store + URL State
**Type:** state
**Files:** stores/booking-store.ts (zustand + nuqs)
**Implementation:** selectedService, selectedStaffId, selectedDate, selectedSlot, customerInfo, currentStep. URL sync. Back-button safe.
**AC:**
- [ ] State persists across steps
- [ ] URL params update on step change

### B3.2: Step 1 — Service + Staff ('use client')
**Type:** component
**Files:** components/booking/steps/service-step.tsx
**Implementation:** Service card + staff selector. Blue border on selected via useState.
**AC:**
- [ ] 'use client' + useState for selectedStaff
- [ ] Selected: blue border (not hardcoded)

### B3.3: Step 2 — Date & Time ('use client')
**Type:** component
**Files:** components/booking/steps/date-time-step.tsx
**Implementation:** Week view. Date click → isLoading → skeleton → mock slots. Grouped Morning/Afternoon/Evening. TZ warning. Empty state.
**AC:**
- [ ] 'use client' + useState for selectedDay, selectedSlot
- [ ] isLoading → skeleton shimmer
- [ ] Empty: "No availability this week"
- [ ] TZ warning when user≠provider

### B3.4: Step 3 — Confirmation ('use client')
**Type:** component
**Files:** components/booking/steps/confirmation-step.tsx
**Implementation:** Summary + guest form. Validate on blur. Cancel policy visible (BR-009). Confirm spinner. Errors human-readable (BR-038).
**AC:**
- [ ] 'use client' + useState for all fields + onBlur validation
- [ ] Red border + human error message on invalid
- [ ] Cancel policy visible before confirm button
- [ ] Submit: disabled + "Confirming..." spinner

### B3.5: Post-Booking Confirmation
**Type:** page
**Files:** app/(booking)/book/confirmed/page.tsx
**Implementation:** Success. Calendar buttons (BR-015). Reschedule/Cancel links. Booking ref.
**AC:**
- [ ] 3 calendar buttons present
- [ ] Reschedule/Cancel navigate

### B3.6: Booking Wizard Stepper ('use client')
**Type:** component
**Files:** components/booking/booking-wizard.tsx
**Implementation:** 3 circles: active=blue, completed=green, future=gray. Smooth transition.
**AC:**
- [ ] 'use client' + currentStep from store
- [ ] Completed = green checkmark

---

## Phase Checklist
- [ ] Full flow: catalog → steps 1-3 → confirmed
- [ ] All forms validate on blur with human messages
- [ ] Ready for B4
