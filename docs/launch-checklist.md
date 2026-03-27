# Launch Checklist — BookEasy Booking System

## MUST Have BRs (18)

| BR | Requirement | Status |
|----|------------|--------|
| BR-001 | Service catalog with search, filter, sort | |
| BR-002 | Provider availability config | |
| BR-003 | Real-time slot selection | |
| BR-004 | 3-step booking wizard | |
| BR-005 | Guest checkout | |
| BR-006 | Double-booking prevention | |
| BR-007 | Email + SMS confirmation | |
| BR-008 | Cancel/reschedule first-class flows | |
| BR-009 | Cancellation policy visible | |
| BR-010 | Provider dashboard | |
| BR-011 | Provider onboarding <5min | |
| BR-012 | JWT auth + refresh | |
| BR-013 | ABAC ownership checks | |
| BR-014 | Timezone UTC + IANA | |
| BR-030 | Async notification dispatch | |
| BR-031 | Pagination on list endpoints | |
| BR-032 | OpenAPI/Swagger | |
| BR-033 | Developer README | |

## Infrastructure

| Check | Status |
|-------|--------|
| Production Docker builds (API + Web) | |
| docker-compose.prod.yml starts all services | |
| Database migrations run on startup | |
| Environment validation catches missing vars | |
| Health check endpoint at /v1/health | |
| Swagger docs at /api-docs | |
| CORS restricted to production domain | |
| JWT secret is production-grade (not default) | |
| No test credentials in production config | |

## Testing

| Check | Status |
|-------|--------|
| Backend e2e tests: 13 pass | |
| Frontend component tests: 10 pass | |
| IDOR audit: all mutations return 403 for non-owners | |
| Rate limiting: auth + bookings throttled | |
| Double-booking: holds under 20x concurrent load | |
| Input validation: extra fields stripped | |

## Security

| Check | Status |
|-------|--------|
| Passwords hashed (bcryptjs) | |
| JWT 15min expiry + HttpOnly refresh cookie | |
| ResourceOwnerGuard on all mutation endpoints | |
| ValidationPipe whitelist + forbidNonWhitelisted | |
| Rate limiting on auth (5/60s) + bookings (20/60s) | |
| Medical vertical deferred (no PHI in v1) | |
