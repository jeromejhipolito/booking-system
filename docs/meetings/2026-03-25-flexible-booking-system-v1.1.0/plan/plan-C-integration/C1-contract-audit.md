<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# C1: Contract Audit

**Plan:** Integration
**Depends on:** A2 + B2 (both complete)
**Verify before starting:** API returns data + frontend renders mock data
**BRs covered:** All (cross-cutting)
**Estimated tasks:** 4

---

## Tasks

### C1.1: Audit API Response Shapes
**Type:** audit
**Files:** Create plan/contract-audit-report.md
**Implementation:** curl each endpoint, compare vs mock-data.ts field-by-field. Record mismatches.
**AC:**
- [ ] Every endpoint documented
- [ ] Mismatch report produced

### C1.2: Fix Backend Gaps
**Type:** fix
**Implementation:** Add missing BR-required fields. Re-curl confirms.
**AC:**
- [ ] All gaps fixed

### C1.3: Fix Frontend Mock Mismatches
**Type:** fix
**Files:** lib/mock-data.ts, consuming components
**Implementation:** Align mocks to actual API shapes. Add transforms if needed.
**AC:**
- [ ] Mocks match API
- [ ] Zero TypeScript errors

### C1.4: Shared Type Alignment
**Type:** fix
**Files:** packages/shared-types/src/index.ts
**Implementation:** Verify types match both sides. Rebuild.
**AC:**
- [ ] Both apps compile

---

## Phase Checklist
- [ ] Audit complete, all gaps fixed
- [ ] Ready for C2
