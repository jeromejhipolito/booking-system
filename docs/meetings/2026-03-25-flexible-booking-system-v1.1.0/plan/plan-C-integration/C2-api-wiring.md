<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# C2: API Client Wiring + Auth

**Plan:** Integration
**Depends on:** C1-contract-audit
**Verify before starting:** Contract audit report zero mismatches
**BRs covered:** BR-001, BR-005, BR-012, BR-034
**Estimated tasks:** 5

---

## Tasks

### C2.1: API Client + React Query
**Type:** library
**Files:** lib/api-client.ts, lib/query-provider.tsx
**Implementation:** Fetch wrapper with auto-JWT, 401→refresh. React Query hooks. staleTime 30s availability, 5min services.
**AC:**
- [ ] Authenticated requests work
- [ ] 401 triggers refresh

### C2.2: Replace Service Catalog Mocks
**Type:** integration
**Files:** app/(public)/services/page.tsx, hooks/use-services.ts
**Implementation:** useServices() replaces mock import. Search via API ?search=. Skeleton during fetch.
**AC:**
- [ ] Catalog loads real data
- [ ] Search sends query to API
- [ ] Skeleton shown during fetch

### C2.3: Wire Auth Pages
**Type:** integration
**Files:** app/(auth)/login/page.tsx, app/(auth)/register/page.tsx
**Implementation:** Call real API. Store JWT. Redirect. Human error messages (BR-038).
**AC:**
- [ ] Register creates real user
- [ ] Login returns JWT
- [ ] "Email already registered" not "409"

### C2.4: CORS Configuration
**Type:** config
**Files:** apps/api/.env, apps/web/.env.local
**Implementation:** CORS allowlist. NEXT_PUBLIC_API_URL.
**AC:**
- [ ] No CORS errors

### C2.5: SSR Verification
**Type:** verification
**Files:** none (test existing pages)
**Implementation:** `curl /` and `curl /services` return full HTML without JS. Lighthouse SEO >= 90. Per BR-034.
**AC:**
- [ ] curl returns service card HTML
- [ ] Lighthouse SEO >= 90

---

## Phase Checklist
- [ ] Real data, auth E2E, CORS, SSR verified
- [ ] Ready for C3
