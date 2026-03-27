<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# A2: Auth, Guards & Core Entity CRUD

**Plan:** Backend
**Depends on:** A1-setup
**Verify before starting:** `npx nest build` → compiles, `pg_isready` → accepting
**BRs covered:** BR-005, BR-011, BR-012, BR-013, BR-031, BR-038
**Estimated tasks:** 6

---

## Tasks

### A2.1: User Entity + Auth Endpoints
**Type:** module
**Files:** apps/api/src/modules/user/ (entity, service, auth.service, auth.controller)
**Implementation:** POST /auth/register (bcryptjs, return JWT), POST /auth/login. Rate limit 5/60s. Per BR-012. Human-readable error messages (BR-038): "Email already registered", "Invalid credentials".
**AC:**
- [ ] Register returns JWT; duplicate email → human message not raw code
- [ ] Login returns JWT; wrong password → "Invalid credentials"

### A2.2: JWT + Refresh Tokens
**Type:** auth
**Files:** strategies/jwt.strategy.ts, refresh-token.entity.ts
**Implementation:** 15min access JWT. Refresh: HttpOnly Secure SameSite=Strict. Payload: {sub, role} only. Per BR-012.
**AC:**
- [ ] JWT expires after 15 min
- [ ] Refresh renews access token

### A2.3: RBAC + ABAC Guards
**Type:** guards
**Files:** guards/ (jwt-auth, roles, resource-owner), decorators/ (@Public, @Roles, @ResourceOwner)
**Implementation:** JwtAuthGuard global. ResourceOwnerGuard checks ownership. Per BR-013.
**AC:**
- [ ] @Public bypasses auth
- [ ] ResourceOwnerGuard: non-owner gets 403

### A2.4: Provider Entity + CRUD (Paginated)
**Type:** module
**Files:** apps/api/src/modules/provider/
**Implementation:** Provider CRUD. GET returns paginated response (BR-031). Onboarding: businessName + timezone only. Per BR-011.
**AC:**
- [ ] GET returns {data, total, page, limit}
- [ ] PATCH blocked for non-owners

### A2.5: Service Entity + CRUD (Paginated + Search)
**Type:** module
**Files:** apps/api/src/modules/service/
**Implementation:** GET /services returns paginated + filterable. ?search= ILIKE filter. Per BR-001, BR-031.
**AC:**
- [ ] GET returns paginated response
- [ ] ?search= filters by name

### A2.6: Customer Entity (Guest Support)
**Type:** module
**Files:** apps/api/src/modules/customer/
**Implementation:** findOrCreateByEmail for guest checkout. Per BR-005.
**AC:**
- [ ] Guest customer created without account

---

## Phase Checklist
- [ ] Auth E2E, guards enforce RBAC+ABAC, CRUD paginated, human error messages
- [ ] Ready for A3
