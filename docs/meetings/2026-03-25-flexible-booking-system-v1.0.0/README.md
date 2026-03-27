<!-- smart-workflows v4.21.0 | company | 2026-03-25 -->
# Meeting Minutes: Flexible Booking System

| Field | Value |
|-------|-------|
| **Date** | 2026-03-25 |
| **Subject** | Create flexible booking system for all services. NestJS backend + frontend recommendation. |
| **Type** | Company Perspective Review |
| **Decision** | APPROVED WITH CONDITIONS |
| **Attendees** | CEO, CTO, COO (Leadership); Backend Engineer, Frontend Engineer, Security Engineer (Engineering); Product Manager, UX Designer (Product); End User (Client) |

## Verdict Board

| Role | Group | Verdict | Key Insight |
|------|-------|---------|-------------|
| CEO | Leadership | CONCERNS | Market is real but contested. Pick one vertical first. |
| CTO | Leadership | YES | NestJS + Next.js is the right stack. "All services" is architecture, not product. |
| Backend Engineer | Engineering | NEUTRAL | Double-booking prevention and domain modeling are P0 correctness problems. |
| Frontend Engineer | Engineering | STRONG YES | Next.js App Router — shared Zod schemas, RSC for SEO, URL-first booking state. |
| Product Manager | Product | CONCERNS | Solution in search of a problem. No beachhead, no metric, no kill criteria. |
| UX Designer | Product | YES | Shadcn/ui recommended. Date/time picker accessibility is highest risk. |
| Security Engineer | Engineering | CONCERNS | "Including medical" imports HIPAA. ABAC required. Cancel endpoints are IDOR targets. |
| End User | Client | NEUTRAL | Users want fast and certain, not flexible. Guest checkout non-negotiable. |

## Discussion Summary

### Leadership
- Market opportunity is real ($400M+ scheduling software TAM) but saturated with vertical incumbents
- NestJS is architecturally sound — module system enforces domain separation
- Must pick one beachhead vertical before writing code; "all services" at v1 fragments everything

### Engineering
- PostgreSQL is mandatory: `tstzrange` for slots, `EXCLUDE USING gist` for DB-level double-booking prevention, JSONB for service config
- Next.js App Router unanimously recommended: SSR for SEO, shared TypeScript/Zod schemas, RSC for catalog pages
- CQRS from day one: write model enforces booking invariants, read model serves availability queries
- Cancel/reschedule endpoints are highest IDOR risk — ABAC ownership check required on every mutation
- HIPAA scope must be resolved before any medical data touches the system

### Product
- "Flexible for all services" is a technology description, not a user problem
- No validated user need, no competitive differentiation hypothesis, no success metrics
- Recommended: 10 provider interviews before code, North Star = "weekly active bookings per provider"
- P0 MVP: availability setup, self-booking link, confirmation/reminders, calendar sync

### Client Perspectives
- Guest checkout is non-negotiable — account creation before booking = abandonment
- Cancellation policy must be visible before commitment, not buried in terms
- Per-service-type notification timing needed (medical: 48h, fitness: 2h)
- One-tap rescheduling preserving original preferences
- Calendar integration (.ics, Google Calendar) expected by default in 2026

## Decisions Made

| # | Decision | Raised By | Agreed By | Status |
|---|----------|-----------|-----------|--------|
| D-1 | Backend: NestJS with PostgreSQL, CQRS pattern | CTO, Backend | Consensus | DECIDED |
| D-2 | Frontend: Next.js App Router with Shadcn/ui | CTO, Frontend, UX | Consensus | DECIDED |
| D-3 | Monorepo: Turborepo with shared Zod schemas | Frontend, CTO | Engineering consensus | DECIDED |
| D-4 | Pick ONE beachhead vertical for v1 launch | CEO, PM | Consensus | DECIDED |
| D-5 | Defer medical vertical to v2+ (HIPAA scope) | Security, PM | Consensus | DECIDED |
| D-6 | Guest checkout required — no account wall | End User, UX | Consensus | DECIDED |
| D-7 | Double-booking prevention via PostgreSQL GiST exclusion constraint | Backend, CTO | Engineering consensus | DECIDED |
| D-8 | ABAC for resource ownership on all mutation endpoints | Security | Engineering consensus | DECIDED |
| D-9 | Cancel/reschedule via token-based links (no login required) | End User, UX | Consensus | DECIDED |

## Consensus Points

- NestJS + Next.js + PostgreSQL is the right stack
- "All services" is an architecture goal, not a product strategy — v1 targets one vertical
- Double-booking prevention must be database-level, not application-level
- Guest checkout is non-negotiable for the booking flow
- Cancel/reschedule endpoints are the highest security and UX risk
- Medical vertical deferred to v2+ due to HIPAA compliance burden
- Timezone handling must be built in from day one

## Tensions & Trade-offs

| Tension | Side A (Roles) | Side B (Roles) | Core Trade-off |
|---------|---------------|---------------|----------------|
| Scope | PM, CEO: pick vertical NOW, validate before code | CTO, Frontend: architecture supports all, product targets one | Validation vs. velocity |
| Medical | Security: HIPAA changes everything, no shortcuts | PM: defer to v2+, start with low-compliance vertical | Compliance cost vs. market breadth |
| Flow design | UX: per-service-type flows for best experience | Frontend: unified flow with config for engineering speed | UX quality vs. dev speed |
| Build timing | PM: 10 interviews before any code | CTO: architecture decisions are orthogonal to validation | Discovery vs. delivery |

## Overall Score

| Dimension | Score (1-5) | Contributing Roles |
|-----------|-------------|-------------------|
| Business Viability | 2.3 | CEO, PM |
| Technical Soundness | 4.0 | CTO, Backend, Frontend |
| User Experience | 2.6 | UX Designer, End User |
| Operational Feasibility | 2.8 | Security, Backend |
| Market Readiness | 2.0 | PM, CEO |

**Overall: 2.7/5**

## Action Items

| # | Action | Owner | Deadline | Depends On |
|---|--------|-------|----------|-----------|
| A-1 | Pick beachhead vertical (fitness/beauty/consulting) | PM, CEO | Before development | - |
| A-2 | Define double-booking prevention strategy | Backend | Week 1 | - |
| A-3 | Define auth model (ABAC) and token strategy | Security | Week 1 | - |
| A-4 | Set up Nx/Turborepo monorepo with shared packages | CTO | Week 1 | - |
| A-5 | Define 3 concrete service types for v1 | PM | Before development | A-1 |
| A-6 | Define success metrics and kill criteria | PM, CEO | Before development | A-1 |

## Open Questions

| # | Question | Raised By | Assigned To | Due |
|---|----------|-----------|-------------|-----|
| Q-1 | Which vertical has the most underserved providers willing to switch? | CEO | PM | Before dev |
| Q-2 | Is payment at booking time or at service time? | Backend | PM | Week 1 |
| Q-3 | Real-time availability (WebSocket) or polling (30s)? | Frontend | CTO | Week 1 |
| Q-4 | Multi-tenancy model: shared DB with tenant scoping or tenant-per-schema? | Security | Backend | Week 1 |

## Next Steps

- **Immediate:** Pick beachhead vertical and validate with 10 provider interviews
- **Convert to plan:** Run `/smart:company --to-plan docs/meetings/2026-03-25-flexible-booking-system` to generate phased implementation plan
