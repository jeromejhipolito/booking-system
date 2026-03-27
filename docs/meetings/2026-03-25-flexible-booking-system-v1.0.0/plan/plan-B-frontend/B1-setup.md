<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# B1: Frontend Project Setup + Design System

**Plan:** Frontend
**Depends on:** none
**Verify before starting:** `node --version` → expected: v20+
**BRs covered:** BR-001 (partial), BR-014 (partial)
**Estimated tasks:** 5

---

## Tasks

### B1.1: Scaffold Next.js App in Monorepo

**Type:** scaffolding
**Files:**
- `apps/web/` — create: Next.js 14 App Router
- `apps/web/next.config.js` — create: transpile shared packages
- `apps/web/tsconfig.json` — create: path aliases to shared packages

**Implementation:**
Next.js with App Router, TypeScript, Tailwind CSS. Configure `transpilePackages` for `@booking-system/shared-*`. Path aliases in tsconfig. PostCSS + Autoprefixer.

**AC:**
- [ ] `pnpm run dev` starts on :3000
- [ ] Shared types importable: `import { IService } from '@booking-system/shared-types'`

---

### B1.2: Design System Tokens + Tailwind Config

**Type:** config
**Files:**
- `apps/web/styles/globals.css` — create: CSS variables from BR wireframes
- `apps/web/tailwind.config.js` — create: extend with design tokens

**Implementation:**
CSS variables: `--color-primary: #2563EB`, `--color-success: #16A34A`, `--color-danger: #DC2626`. Component tokens: `--card-radius: 12px`, `--slot-height: 44px`, `--calendar-row: 48px`. Tailwind extend: colors, borderRadius, fontFamily (Inter).

**AC:**
- [ ] `bg-primary` renders blue-600
- [ ] `rounded-card` renders 12px radius

---

### B1.3: Install Shadcn/ui + Core Components

**Type:** library
**Files:**
- `apps/web/components/ui/` — create: button, card, input, label, select, skeleton, badge, dialog

**Implementation:**
`npx shadcn-ui@latest init`. Add components: button, card, input, label, select, skeleton, badge, dialog, sheet. These are the building blocks for all screens in BRs.

**AC:**
- [ ] All listed Shadcn components render correctly
- [ ] Components use design system tokens (not hardcoded colors)

---

### B1.4: Mock Data File

**Type:** library
**Files:**
- `apps/web/lib/mock-data.ts` — create: mock services, providers, bookings, slots

**Implementation:**
Define mock data using shared TypeScript interfaces (`IService`, `IProvider`, `IBooking`, `ITimeSlot`, `IAvailabilityResponse`). 9 demo services across categories. Mock availability slots for date range. Mock bookings for dashboard. This data drives ALL frontend pages until Plan C replaces with real API.

**AC:**
- [ ] Mock data matches shared type interfaces exactly
- [ ] Enough data to populate all 6 wireframe screens

---

### B1.5: Layout Components (Header + Footer)

**Type:** component
**Files:**
- `apps/web/components/layout/header.tsx` — create
- `apps/web/components/layout/footer.tsx` — create
- `apps/web/app/layout.tsx` — create: root layout with font, providers

**Implementation:**
Header: logo, nav links (Services, How It Works), Login/Sign Up buttons. Active nav state: bold + blue underline on current route (use `usePathname`). Footer: logo, links, copyright. Mobile: hamburger menu.

**AC:**
- [ ] Header renders on all pages
- [ ] Current nav item visually distinct (bold + underline)
- [ ] Mobile hamburger menu opens/closes
- [ ] Hover states on all interactive elements

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Next.js dev server runs
- [ ] Design tokens applied via Tailwind
- [ ] Shadcn components render
- [ ] Mock data file covers all screens
- [ ] Header shows active nav state
- [ ] Ready for B2
