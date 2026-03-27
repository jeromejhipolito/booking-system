<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-25 -->
# C1: Contract Audit — Backend API vs Frontend Mocks

**Plan:** Integration
**Depends on:** A2-auth-models + B2-public-pages (both must be complete)
**Verify before starting:** `curl -s http://localhost:3001/v1/services` → 200 AND `/services` page renders with mock data → confirmed
**BRs covered:** All BRs (cross-cutting audit)
**Estimated tasks:** 4

---

## Tasks

### C1.1: Audit API Response Shapes

**Type:** audit
**Files:**
- Read: all backend controllers (apps/api/src/modules/*/\*.controller.ts)
- Read: `apps/web/lib/mock-data.ts`
- Create: `docs/meetings/.../plan/contract-audit-report.md`

**Implementation:**
For each endpoint in Plan A: curl the running API, capture actual JSON response shape. Compare field-by-field against mock data types in `mock-data.ts`. Record every mismatch in a report table: Endpoint | Field | Backend | Frontend Mock | Action.

**AC:**
- [ ] Every API endpoint response documented
- [ ] Every mock data shape compared
- [ ] Mismatch report produced with specific actions

---

### C1.2: Fix Backend Gaps

**Type:** fix
**Files:**
- Backend files as identified in audit report

**Implementation:**
For each "backend missing" entry in the audit: add the missing field/endpoint to the backend. Only fix gaps that are required by BRs — don't add fields the frontend invented that aren't in BRs.

**AC:**
- [ ] All BR-required backend gaps fixed
- [ ] Re-curl confirms correct response shapes

---

### C1.3: Fix Frontend Mock Mismatches

**Type:** fix
**Files:**
- `apps/web/lib/mock-data.ts` — modify
- Components that consume incorrect mock shapes — modify

**Implementation:**
For each "frontend mock wrong" entry: update mock-data.ts to match actual backend shape. Update any component that directly references the wrong field name. Add transform functions in API client if types differ (e.g., priceCents → display as dollars).

**AC:**
- [ ] Mock data matches actual API response shapes exactly
- [ ] Components render correctly with updated mock shapes
- [ ] No TypeScript errors after mock updates

---

### C1.4: Shared Type Alignment

**Type:** fix
**Files:**
- `packages/shared-types/src/index.ts` — modify if needed
- `packages/shared-schemas/src/index.ts` — modify if needed

**Implementation:**
Verify shared types match both backend entities AND frontend expectations. Fix any drift. Rebuild shared packages. Verify both apps compile with aligned types.

**AC:**
- [ ] `npx nest build` compiles
- [ ] `next build` compiles (or dev server renders without errors)
- [ ] Zero TypeScript errors across monorepo

---

## Phase Checklist

- [ ] Contract audit report complete
- [ ] All backend gaps fixed
- [ ] All frontend mock mismatches fixed
- [ ] Shared types aligned
- [ ] Both apps compile cleanly
- [ ] Ready for C2
