<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# B2: Public Pages — Landing + Service Catalog

**Plan:** Frontend
**Depends on:** B1-setup
**Verify before starting:** `curl localhost:3000` → 200, header active nav works
**BRs covered:** BR-001, BR-005, BR-034, BR-035, BR-037, BR-038
**Estimated tasks:** 5

---

## Tasks

### B2.1: Landing Page (RSC with SEO)
**Type:** page
**Files:** app/page.tsx (RSC OK — no interactive elements)
**Implementation:** Hero, stats, featured services, How It Works, CTA, footer. Metadata export for title+OG (BR-035). SSR verified (BR-034).
**AC:**
- [ ] `curl localhost:3000` returns full HTML with service cards (no JS needed)
- [ ] meta title + OG tags in HTML head

### B2.2: Service Catalog (INTERACTIVE + SEO)
**Type:** page ('use client')
**Files:** app/(public)/services/page.tsx
**Implementation:** useState for search, selectedCategory, sortBy, isLoading. .filter() on mock data. Skeleton loading. Empty state. Per BR-001, BR-037 (each card links to shareable /services/{id} URL).
**AC:**
- [ ] File has 'use client' + useState for search/category/sort
- [ ] .filter() call on data array
- [ ] selectedCategory state (NOT hardcoded i===0)
- [ ] isLoading → skeleton cards
- [ ] length === 0 → "No services found"
- [ ] Cards link to /services/{id} (shareable URL per BR-037)

### B2.3: Auth Pages (Login + Register)
**Type:** page ('use client')
**Files:** app/(auth)/login/page.tsx, app/(auth)/register/page.tsx
**Implementation:** useState for all fields. Validation on blur. Loading spinner. Error messages human-readable (BR-038): "Email already registered", not "409 Conflict".
**AC:**
- [ ] Both have 'use client' + useState + onChange
- [ ] Validation on blur: red border + human error text
- [ ] Submit: spinner in button
- [ ] Error messages are user-friendly (not raw status codes)

### B2.4: Service Card Component
**Type:** component
**Files:** components/services/service-card.tsx
**Implementation:** Avatar, name, provider, rating, price, next available. Hover: shadow + blue border. Skeleton variant.
**AC:**
- [ ] Hover transition smooth
- [ ] Skeleton variant renders placeholders

### B2.5: Service Detail Page (SEO + Shareable)
**Type:** page (RSC)
**Files:** app/(public)/services/[id]/page.tsx
**Implementation:** RSC with generateMetadata for per-service title+description+OG (BR-035). Full service info. "Book Now" CTA. Shareable URL (BR-037). Per BR-034: SSR, no JS needed for content.
**AC:**
- [ ] `curl /services/{id}` returns full HTML with service details
- [ ] Dynamic meta title: "{Service Name} - BookEasy"
- [ ] "Book Now" links to /book?service={id}

---

## Phase Checklist
- [ ] Search/filter/sort work, skeletons shown, empty state, SEO tags, shareable URLs
- [ ] Ready for B3
