<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# C2: API Client Wiring + Auth Flow

**Plan:** Integration
**Depends on:** C1-contract-audit
**Verify before starting:** Contract audit report shows zero unresolved mismatches → confirmed
**BRs covered:** BR-001, BR-005, BR-012
**Estimated tasks:** 4

---

## Tasks

### C2.1: API Client + React Query Setup

**Type:** library
**Files:**
- `apps/web/lib/api-client.ts` — create: fetch wrapper with auth headers
- `apps/web/lib/query-provider.tsx` — create: React Query provider

**Implementation:**
API client: base URL from env, request interceptor adds JWT, response interceptor handles 401 → refresh token. React Query defaults: staleTime 30s for availability, 5min for services. Custom hooks: `useServices(filters)`, `useAvailability(serviceId, dateRange)`, `useCreateBooking()`.

**AC:**
- [ ] API client makes authenticated requests
- [ ] 401 response triggers token refresh automatically
- [ ] React Query hooks fetch real data from running API

---

### C2.2: Replace Service Catalog Mocks with Real API

**Type:** integration
**Files:**
- `apps/web/app/(public)/services/page.tsx` — modify: use useServices() instead of mock data
- `apps/web/hooks/use-services.ts` — create

**Implementation:**
Replace mock data import with `useServices()` hook. Search, filter, sort still work — but now filter via API query params instead of client-side mock filter. Loading skeleton shown while React Query fetches. Empty state when no results.

**AC:**
- [ ] Service catalog loads real data from `GET /v1/services`
- [ ] Search sends `?search=` query param to API
- [ ] Loading skeleton shown during fetch
- [ ] Empty state shown when API returns []

---

### C2.3: Wire Auth Pages to Real API

**Type:** integration
**Files:**
- `apps/web/app/(auth)/login/page.tsx` — modify: call real login endpoint
- `apps/web/app/(auth)/register/page.tsx` — modify: call real register endpoint

**Implementation:**
Login form calls `POST /v1/auth/login`, stores JWT, redirects. Register form calls `POST /v1/auth/register`, stores JWT, redirects based on role. Error handling: 401 invalid credentials, 409 duplicate email. JWT stored in memory (Zustand), refresh token in cookie.

**AC:**
- [ ] Register creates real user in database
- [ ] Login returns JWT for valid credentials
- [ ] Invalid credentials shows error message
- [ ] Duplicate email shows "already registered" error
- [ ] Redirect to correct page after auth

---

### C2.4: CORS + Cookie Configuration

**Type:** config
**Files:**
- `apps/api/.env` — modify: add frontend URL to CORS_ORIGINS
- `apps/web/.env.local` — create: NEXT_PUBLIC_API_URL

**Implementation:**
API CORS: allowlist frontend origin. Credentials: true. Frontend env: `NEXT_PUBLIC_API_URL=http://localhost:3001/v1`. Verify preflight OPTIONS requests pass.

**AC:**
- [ ] Frontend fetches from API without CORS errors
- [ ] Cookies sent with credentials: true
- [ ] OPTIONS preflight returns correct headers

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Service catalog loads real data from API
- [ ] Auth flow works end-to-end (register → login → authenticated requests)
- [ ] CORS configured correctly
- [ ] No mock data imports remain in wired pages
- [ ] Ready for C3
