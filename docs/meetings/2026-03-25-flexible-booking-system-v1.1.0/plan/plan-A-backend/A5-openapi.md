<!-- smart-workflows v4.21.0 | company --to-plan | 2026-03-26 -->
# A5: OpenAPI/Swagger + Event Tracking Schema

**Plan:** Backend
**Depends on:** A4-notifications
**Verify before starting:** All API endpoints working, notifications async
**BRs covered:** BR-032, BR-036
**Estimated tasks:** 3

---

## Tasks

### A5.1: OpenAPI/Swagger Setup
**Type:** config
**Files:** apps/api/src/main.ts (modify), install @nestjs/swagger
**Implementation:** SwaggerModule.setup('/api-docs'). DocumentBuilder with title, version, bearer auth. Per BR-032.
**AC:**
- [ ] /api-docs loads Swagger UI
- [ ] All endpoints visible

### A5.2: Annotate All Endpoints
**Type:** annotations
**Files:** All controllers + DTOs
**Implementation:** @ApiTags, @ApiOperation, @ApiResponse on every endpoint. DTO classes with @ApiProperty. Error codes documented (400, 401, 403, 404, 409, 429). Per BR-032.
**AC:**
- [ ] Every endpoint has request/response schema
- [ ] Error codes documented per endpoint

### A5.3: Event Tracking Schema Definition
**Type:** schema
**Files:** packages/shared-types/src/events.ts (create)
**Implementation:** Define standardized event taxonomy (noun-verb, no PII): booking.created, booking.cancelled, booking.rescheduled, slot.viewed, service.searched, funnel.step_completed. Per BR-036.
**AC:**
- [ ] Event types defined with TypeScript interfaces
- [ ] No PII in event payloads

---

## Phase Checklist
- [ ] Swagger UI at /api-docs with all endpoints documented
- [ ] Event schema defined
- [ ] Backend Plan A complete
