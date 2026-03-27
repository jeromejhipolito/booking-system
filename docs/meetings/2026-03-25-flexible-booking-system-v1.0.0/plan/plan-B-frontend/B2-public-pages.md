<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# B2: Public Pages — Landing + Service Catalog

**Plan:** Frontend
**Depends on:** B1-setup
**Verify before starting:** `curl -s http://localhost:3000` → expected: 200 HTML
**BRs covered:** BR-001, BR-005
**Estimated tasks:** 4

---

## Tasks

### B2.1: Landing Page

**Type:** page
**Files:**
- `apps/web/app/page.tsx` — create: RSC landing page

**Implementation:**
Hero section with gradient bg, headline, CTA buttons (Browse Services, List Your Business). Stats row (2,500+ providers, 50K+ bookings, 4.9 rating). Featured services grid (6 cards from mock data). How It Works 3-step section. Provider CTA banner. Footer. See BR wireframes Screen 1 for layout reference.

**AC:**
- [ ] Page renders with all sections
- [ ] Service cards show price, duration, rating, next availability
- [ ] CTA buttons navigate to /services and /register
- [ ] Hover states on cards (elevated shadow + scale)
- [ ] Responsive: single column on mobile, 3-col grid on desktop

---

### B2.2: Service Catalog Page (with interactivity)

**Type:** page
**Files:**
- `apps/web/app/(public)/services/page.tsx` — create: RSC with client islands

**Implementation:**
Per wireframe Screen 1. Search bar: filters mock data on keystroke (debounced 300ms). Category pills: single-select filter (All, Beauty, Wellness, Fitness, Home). Sort dropdown: price asc/desc, rating, next available. Card grid from filtered mock data. Results count. Load More button.

**AC:**
- [ ] Search filters cards by service name + provider name in real-time
- [ ] Category pills filter correctly; selected pill = blue bg + white text
- [ ] Sort dropdown re-orders cards
- [ ] Loading skeleton shown for 500ms on filter change (simulated)
- [ ] Empty state: "No services found. Try a different search."
- [ ] Cards show hover state: elevated shadow + blue border

---

### B2.3: Auth Pages (Login + Register)

**Type:** page
**Files:**
- `apps/web/app/(auth)/login/page.tsx` — create
- `apps/web/app/(auth)/register/page.tsx` — create

**Implementation:**
Login: email + password form, forgot password link, sign up link. Register: role selector (customer/provider), name + email + password form. Both: form validation (inline errors on blur), loading spinner on submit, success/error messages. Per BR-005 (guest checkout — these are optional, not required for booking).

**AC:**
- [ ] Login form validates email format + password required on blur
- [ ] Register role selector toggles between customer/provider
- [ ] Submit button shows spinner during submission
- [ ] Inline error messages shown on invalid fields (red border + text)
- [ ] Success message shown on successful mock submission

---

### B2.4: Service Detail Card Component

**Type:** component
**Files:**
- `apps/web/components/services/service-card.tsx` — create

**Implementation:**
Reusable card: provider avatar (initials), service name, provider name, star rating, price/duration, next availability badge (green dot). Hover: elevated shadow + blue border + scale 1.02. Click navigates to `/book?service={id}`. Loading variant: skeleton placeholder.

**AC:**
- [ ] Card renders all data fields from IService
- [ ] Hover animation smooth (transition-all duration-300)
- [ ] Skeleton variant renders gray placeholder blocks
- [ ] Touch target minimum 44px on mobile

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Search, filter, sort all work with mock data
- [ ] Loading skeletons shown during transitions
- [ ] Empty states displayed correctly
- [ ] All hover/focus states functional
- [ ] Mobile responsive (375px tested)
- [ ] Ready for B3
