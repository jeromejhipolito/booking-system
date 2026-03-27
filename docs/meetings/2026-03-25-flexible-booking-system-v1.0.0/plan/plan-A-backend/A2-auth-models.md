<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# A2: Auth, Guards & Core Entity CRUD

**Plan:** Backend
**Depends on:** A1-setup (must be complete and verified)
**Verify before starting:** `docker exec booking-postgres pg_isready` → expected: accepting connections
**BRs covered:** BR-005, BR-011, BR-012, BR-013
**Estimated tasks:** 6

---

## Tasks

### A2.1: User Entity + Registration + Login

**Type:** module
**Files:**
- `apps/api/src/modules/user/` — create: user.entity, user.service, auth.service, auth.controller

**Implementation:**
User entity: id, email, passwordHash, name, role, isEmailVerified. Auth endpoints: `POST /v1/auth/register` (hash with bcryptjs, return JWT), `POST /v1/auth/login` (validate, return JWT). Rate limit: 5 req/60s on auth endpoints. Per BR-012.

**AC:**
- [ ] `curl POST /v1/auth/register` returns JWT + user object
- [ ] `curl POST /v1/auth/login` returns JWT for valid credentials
- [ ] Duplicate email returns 409 Conflict

---

### A2.2: JWT Strategy + Refresh Tokens

**Type:** auth
**Files:**
- `apps/api/src/modules/user/strategies/jwt.strategy.ts` — create
- `apps/api/src/modules/user/refresh-token.entity.ts` — create

**Implementation:**
Short-lived JWT (15min). Refresh token: opaque, hashed in DB, HttpOnly Secure SameSite=Strict cookie. JWT payload: `{ sub: userId, role }` — no sensitive data. Per BR-012.

**AC:**
- [ ] JWT expires after 15 minutes
- [ ] Refresh token renews access token
- [ ] Refresh token stored as HTTP-only cookie

---

### A2.3: RBAC + ABAC Guards

**Type:** guards
**Files:**
- `apps/api/src/guards/jwt-auth.guard.ts` — create
- `apps/api/src/guards/roles.guard.ts` — create
- `apps/api/src/guards/resource-owner.guard.ts` — create
- `apps/api/src/decorators/` — create: @Public, @Roles, @ResourceOwner

**Implementation:**
JwtAuthGuard applied globally, @Public bypasses. RolesGuard checks role metadata. ResourceOwnerGuard loads resource by :id param, verifies user owns it. Admins bypass. Token-based access allowed for cancel/reschedule. Per BR-013.

**AC:**
- [ ] @Public endpoints accessible without auth
- [ ] @Roles('provider') blocks customers
- [ ] ResourceOwnerGuard prevents cross-user access on mutations

---

### A2.4: Provider Entity + Onboarding CRUD

**Type:** module
**Files:**
- `apps/api/src/modules/provider/` — create: entity, service, controller

**Implementation:**
Provider: id, userId, businessName, timezone (IANA), settings (JSONB with PROVIDER_DEFAULTS). Endpoints: `POST /v1/providers` (provider only), `GET /v1/providers/:id` (public), `PATCH /v1/providers/:id` (owner only). Onboarding requires only businessName + timezone. Per BR-011.

**AC:**
- [ ] Provider created with sensible defaults pre-filled
- [ ] GET returns public profile
- [ ] PATCH blocked for non-owners

---

### A2.5: Service Entity + CRUD

**Type:** module
**Files:**
- `apps/api/src/modules/service/` — create: entity, service, controller

**Implementation:**
Service: id, providerId, name, serviceType, durationMin, priceCents, config (JSONB), status. Endpoints: `POST /v1/services` (provider), `GET /v1/services` (public, filterable), `GET /v1/services/:id` (public), `PATCH /v1/services/:id` (owner), `DELETE /v1/services/:id` (soft delete). Validate with shared Zod schema.

**AC:**
- [ ] Services CRUD works end-to-end via curl
- [ ] GET /v1/services supports search + filter query params
- [ ] Soft delete sets status='inactive'

---

### A2.6: Customer Entity + Guest Support

**Type:** module
**Files:**
- `apps/api/src/modules/customer/` — create: entity, service

**Implementation:**
Customer: id, userId (nullable for guests), name, email, phone, preferences (JSONB). `findOrCreateByEmail` — creates guest customer on-the-fly during booking. Per BR-005.

**AC:**
- [ ] Guest customer created when booking without account
- [ ] Existing email returns existing customer record

---

## Phase Checklist

- [ ] All tasks implemented
- [ ] Auth flow works: register → login → access protected route → refresh
- [ ] Guards enforce RBAC + ABAC
- [ ] Provider, Service, Customer CRUD verified via curl
- [ ] Ready for A3
