<!-- smart-workflows v4.21.0 | company | 2026-03-25 -->
# Meeting Minutes: Flexible Booking System

| Field | Value |
|-------|-------|
| **Date** | 2026-03-25 |
| **Subject** | Create flexible booking system for all services. NestJS backend + frontend recommendation |
| **Type** | Company Perspective Review |
| **Decision** | APPROVED WITH CONDITIONS |
| **Attendees** | CEO, CTO (Leadership); Backend Engineer, Frontend Engineer, Security Engineer (Engineering); Product Manager, UX Designer (Product); End User (Client) |

## Verdict Board

| Role | Group | Verdict | Key Insight |
|------|-------|---------|-------------|
| CEO | Leadership | CONCERNS | Market real but "multi-industry" is not a GTM strategy |
| CTO | Leadership | YES | NestJS sound; real risk is domain model for "flexible" |
| Backend Engineer | Engineering | NEUTRAL | Double-booking prevention is P0 correctness, not a feature |
| Frontend Engineer | Engineering | YES | Next.js App Router; config-driven form engine needed |
| Product Manager | Product | CONCERNS | Tech-first solution, no beachhead, no metrics |
| UX Designer | Product | CONCERNS | "All services" is a category, not a design brief |
| Security Engineer | Engineering | CONCERNS | "Including medical" imports HIPAA silently |
| End User | Client | NEUTRAL | Want fast + certain, not flexible |

## Discussion Summary

### Leadership
- Market opportunity real ($100B+ GMV across verticals) but saturated with incumbents
- NestJS architecturally sound; module system maps to domain boundaries
- Must pick beachhead vertical; every successful horizontal platform started narrow

### Engineering
- PostgreSQL mandatory: row-level locking for slot reservation, not NoSQL
- CQRS from day one: availability queries and booking mutations have divergent scaling
- Next.js App Router unanimously recommended: SSR for discovery, CSR for booking flow
- Shared Zod schemas in Turborepo monorepo eliminates API contract drift
- ABAC over RBAC: booking ownership rules too complex for flat roles
- Transactional outbox for notifications: failed Twilio call cannot rollback confirmed booking

### Product
- No validated user need, no competitive differentiation hypothesis
- Recommended: independent fitness professionals as beachhead (underserved, simple model)
- P0 MLP: bookable calendar link + confirmation + payment capture
- Kill metric: <30 paying customers in 6 months = pivot

### Client Perspectives
- Guest checkout non-negotiable; account creation = abandonment
- Confirmation screen + immediate email/SMS within 60 seconds
- Reschedule/cancel as first-class flows, not buried in help
- Reminders: 24h + 2h before appointment
- Interface must simplify itself for simple tasks (haircut vs consultation)

## Decisions Made

| # | Decision | Raised By | Agreed By | Status |
|---|----------|-----------|-----------|--------|
| D-1 | Backend: NestJS + PostgreSQL + CQRS | CTO, Backend | Consensus | DECIDED |
| D-2 | Frontend: Next.js App Router | CTO, Frontend, Backend | Consensus | DECIDED |
| D-3 | Monorepo: Turborepo with shared Zod schemas | Frontend, CTO | Engineering | DECIDED |
| D-4 | Pick ONE beachhead vertical for v1 | CEO, PM, UX | Consensus | DECIDED |
| D-5 | Defer medical vertical to v2+ (HIPAA) | Security, PM | Consensus | DECIDED |
| D-6 | Guest checkout required | End User, UX | Consensus | DECIDED |
| D-7 | Double-booking prevention via PostgreSQL row-level locking | Backend, CTO | Engineering | DECIDED |
| D-8 | ABAC for resource ownership on all mutations | Security | Engineering | DECIDED |
| D-9 | Cancel/reschedule as first-class flows (not hidden) | End User, UX | Consensus | DECIDED |
| D-10 | Timezone handling built in from day one | CTO, UX, End User | Consensus | DECIDED |

## Consensus Points

- NestJS + Next.js + PostgreSQL is the right stack
- "All services" is architecture, not product — v1 targets one vertical
- Double-booking prevention must be database-level correctness
- Guest checkout non-negotiable
- Cancel/reschedule are the highest security + UX risk
- Medical vertical deferred (HIPAA)
- Timezone handling day one

## Tensions & Trade-offs

| Tension | Side A | Side B | Trade-off |
|---------|--------|--------|-----------|
| Scope | PM, CEO: validate before code | CTO: arch supports all, product targets one | Validation vs velocity |
| Medical | Security: HIPAA changes everything | PM: defer to v2+ | Compliance vs breadth |
| Flow | UX: per-service flows | Frontend: config-driven engine | UX quality vs dev speed |

## Overall Score

| Dimension | Score (1-5) | Roles |
|-----------|-------------|-------|
| Business Viability | 2.2 | CEO, PM |
| Technical Soundness | 3.8 | CTO, Backend, Frontend |
| User Experience | 2.4 | UX, End User |
| Operational Feasibility | 2.6 | Security, Backend |
| Market Readiness | 2.0 | PM, CEO |

**Overall: 2.6/5**

## Action Items

| # | Action | Owner | Deadline |
|---|--------|-------|----------|
| A-1 | Pick beachhead vertical with evidence | PM, CEO | Before dev |
| A-2 | Define concurrency model for slot reservation | Backend | Week 1 |
| A-3 | Define ABAC model + token strategy | Security | Week 1 |
| A-4 | Set up Turborepo monorepo with shared packages | CTO | Week 1 |
| A-5 | Define success metrics + kill criteria | PM, CEO | Before dev |

## Open Questions

| # | Question | Raised By | Assigned To |
|---|----------|-----------|-------------|
| Q-1 | Which vertical has most underserved providers? | CEO | PM |
| Q-2 | Single-tenant or multi-tenant SaaS? | CTO | CTO, Backend |
| Q-3 | Payment at booking or at service time? | Backend | PM |
| Q-4 | Config-driven forms or per-service-type components? | Frontend | UX, Frontend |

## Next Steps

- **Immediate:** Pick beachhead vertical, define success metrics
- **Convert to plan:** `/smart:company --to-plan docs/meetings/2026-03-25-flexible-booking-system-v2`
