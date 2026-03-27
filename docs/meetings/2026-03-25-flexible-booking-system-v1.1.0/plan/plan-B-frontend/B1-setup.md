<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# B1: Frontend Setup + Design System

**Plan:** Frontend
**Depends on:** none
**Verify before starting:** `node --version` → v20+
**BRs covered:** BR-001, BR-014, BR-034, BR-035
**Estimated tasks:** 6

---

## Tasks

### B1.1: Scaffold Next.js in Monorepo
**Type:** scaffolding
**Files:** apps/web/ (Next.js 14 App Router + Tailwind)
**Implementation:** transpilePackages for shared-*. Path aliases.
**AC:**
- [ ] `pnpm dev` starts on :3000
- [ ] Shared types importable

### B1.2: Design Tokens + Tailwind Config
**Type:** config
**Files:** styles/globals.css, tailwind.config.js
**Implementation:** CSS vars: --color-primary, --slot-height: 44px. Tailwind extend.
**AC:**
- [ ] `bg-primary` renders blue-600

### B1.3: Shadcn/ui Core Components
**Type:** library
**Files:** components/ui/ (button, card, input, select, skeleton, badge)
**AC:**
- [ ] Components render, use design tokens

### B1.4: Mock Data File
**Type:** library
**Files:** lib/mock-data.ts
**Implementation:** 9 services, slots, bookings, staff. withDelay() helper.
**AC:**
- [ ] Mock data matches shared type interfaces

### B1.5: Layout (Header with active nav)
**Type:** component ('use client')
**Files:** components/layout/header.tsx
**Implementation:** usePathname() for active nav. Mobile hamburger with useState.
**AC:**
- [ ] File has 'use client'
- [ ] usePathname() drives active styling (not hardcoded)
- [ ] Mobile hamburger opens/closes

### B1.6: SEO Base Setup
**Type:** config
**Files:** app/layout.tsx (metadata), public/robots.txt, app/sitemap.ts
**Implementation:** Default meta title/description. robots.txt allows crawling. Dynamic sitemap for service pages. Per BR-034, BR-035.
**AC:**
- [ ] Default meta tags render in HTML head
- [ ] robots.txt accessible at /robots.txt
- [ ] sitemap.xml accessible at /sitemap.xml

---

## Phase Checklist
- [ ] Next.js runs, tokens applied, mock data ready, header active, SEO base
- [ ] Ready for B2
