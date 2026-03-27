<!-- smart-workflows v4.21.0 | company | 2026-03-25 -->
# Business Requirements: Flexible Booking System

**Date:** 2026-03-25
**Status:** APPROVED WITH CONDITIONS
**Source:** Company Perspective Review (`/smart:company`)

---

## MUST Have (v1 — Launch Blockers)

| ID | Requirement | Source | Owner | Acceptance Criteria |
|----|------------|--------|-------|-------------------|
| BR-001 | Service catalog with search, filter, sort | UX, Frontend | Frontend | Search filters on keystroke (debounced), category pills filter, sort by price/rating/availability |
| BR-002 | Provider availability config (weekly hours, buffer, exceptions) | Backend, CTO | Backend | Provider sets RRULE schedule, exception dates, buffer time between appointments |
| BR-003 | Real-time slot selection | Frontend, End User | Frontend | Available slots for date range, update within 60s of changes |
| BR-004 | 3-step booking wizard (Service → Date/Time → Confirm) | UX, End User | Frontend | Complete in 3 steps max, under 90 seconds for returning users |
| BR-005 | Guest checkout (no account required) | End User, UX | Frontend | Book without account; optional account creation post-booking |
| BR-006 | Double-booking prevention at DB level | Backend, CTO | Backend | PostgreSQL row-level locking prevents overlapping slots; tested at 50x peak |
| BR-007 | Booking confirmation via email + SMS | End User | Backend | Delivered within 60 seconds; includes booking ref + calendar link |
| BR-008 | Cancel/reschedule as first-class flows | End User, Security | Full-stack | Token-based links in email/SMS; under 3 taps; no login required |
| BR-009 | Cancellation policy visible before confirmation | End User, UX | Frontend | Policy + fee displayed on step 3 before submit |
| BR-010 | Provider dashboard with agenda view | UX, PM | Frontend | Today's bookings, buffers, available slots, quick stats |
| BR-011 | Provider onboarding under 5 minutes | PM, UX | Full-stack | Minimal fields + sensible defaults; business name, timezone, first service, hours |
| BR-012 | JWT auth: 15min access + refresh token rotation | Security | Backend | HttpOnly cookie for refresh; never localStorage; revocation support |
| BR-013 | ABAC ownership check on all mutations | Security | Backend | Every cancel/reschedule/update verifies requesting user owns the resource |
| BR-014 | Timezone: UTC storage + IANA display | CTO, UX | Full-stack | Mismatch warning when user/provider timezones differ |
| BR-030 | Async notification dispatch | Performance | Backend | Booking response MUST NOT block on email/SMS delivery; dispatch via job queue (BullMQ/outbox) |
| BR-031 | Pagination on all list endpoints | Performance | Backend | Default page size 20, max 100; cursor-based; unbounded result sets = 400 error |
| BR-032 | OpenAPI/Swagger on all endpoints | Tech Writer | Backend | All 14+ endpoints annotated with request/response schemas + error codes before UAT |
| BR-033 | Developer README | Tech Writer | Full-stack | Setup guide covering local dev, env vars, Docker, run commands, seed data |

## SHOULD Have (v1 — Ship if capacity allows)

| ID | Requirement | Source | Owner | Acceptance Criteria |
|----|------------|--------|-------|-------------------|
| BR-015 | Calendar integration (.ics, Google, Apple) | End User | Frontend | 3 options on confirmation page |
| BR-016 | Configurable reminders (24h, 2h) | End User, PM | Backend | Provider sets timing; customer receives email + SMS |
| BR-017 | Customer dashboard (upcoming, past, favorites) | UX | Frontend | Upcoming with reschedule/cancel; past with rebook |
| BR-018 | Pre-appointment "what to expect" message | End User | Backend | Provider-configurable; sent 24h before |
| BR-019 | Post-service review request | PM | Backend | Sent 2h after appointment end |
| BR-020 | Idempotency on booking creation | Backend | Backend | X-Idempotency-Key prevents duplicates on retry |
| BR-034 | SSR verification on public pages | SEO | Frontend | Catalog + landing HTML renderable without JS; Lighthouse SEO >= 90 |
| BR-035 | Meta tags + Open Graph on public pages | SEO | Frontend | Unique title, description, OG tags on /, /services, /providers/:id |
| BR-036 | Event tracking taxonomy | Data Analyst | Full-stack | Standardized noun-verb events (no PII) instrumented before booking flow ships |
| BR-037 | Shareable booking links per service | Growth | Frontend | Each service has a unique, trackable URL; provider can copy/share |
| BR-038 | Human-readable error messages | Tech Writer | Full-stack | All user-facing errors show remediation language, not raw API codes |

## COULD Have (v1.1)

| ID | Requirement | Source | Owner | Acceptance Criteria |
|----|------------|--------|-------|-------------------|
| BR-021 | Staff/resource management per provider | PM | Backend | Multiple staff with individual availability |
| BR-022 | Recurring appointments | PM | Backend | Weekly/biweekly recurring |
| BR-023 | Payment integration (Stripe) | PM, Security | Full-stack | PCI-compliant via Stripe Elements |
| BR-024 | Provider analytics dashboard | PM | Frontend | Utilization, no-show rate, trends |
| BR-025 | Waitlist management | PM | Backend | Join waitlist; notify on cancellation |
| BR-039 | JSON-LD structured data on service pages | SEO | Frontend | Service schema passes Google Rich Results Test with zero errors |
| BR-040 | Embeddable booking widget for providers | Growth | Frontend | iframe or JS snippet; bookings routed back to platform |
| BR-041 | Post-booking referral prompt | Growth | Frontend | Unique referral link on confirmation; referred signup tracked |
| BR-042 | Anonymized event store for future ML | AI/ML | Backend | Append-only, PII-stripped at write, 24mo retention, schema versioned |
| BR-043 | No-show risk score for providers | AI/ML | Backend | Surface risk > 0.7 to provider; fallback to no score if model unavailable |

## WON'T Have (Deferred)

| ID | Requirement | Reason Deferred | Revisit When |
|----|------------|-----------------|-------------|
| BR-026 | Medical vertical (HIPAA) | PHI encryption, audit logs, BAAs too large for v1 | After v1 PMF |
| BR-027 | Multi-location support | Multi-tenancy complexity | After single-location validated |
| BR-028 | Consumer marketplace | Two-sided marketplace = different product | After provider retention >60% |
| BR-029 | Native mobile app | Web responsive sufficient for v1 | After 10K monthly bookings |

---

## Screen Designs

### Screen 1: Service Catalog
**Purpose:** Browse and discover services
**Route:** `/services`
**BRs:** BR-001, BR-005

```
┌──────────────────────────────────────────────────┐
│  [B] BookEasy    [Search...]    [Log In] [Sign Up]│
│  ● Services  ○ How It Works                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  Browse Services                                 │
│  [🔍 Search services, providers...________]      │
│  [Sort: Recommended ▼]                           │
│                                                  │
│  [● All] [○ Beauty] [○ Fitness] [○ Home] [○ ...] │
│                                                  │
│  9 services found                                │
│                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │JS Haircut  │ │ZW Massage  │ │FP Plumbing │   │
│  │Jane's Salon│ │Zen Wellness│ │Fix-It Pro  │   │
│  │★4.8 (48)   │ │★4.9 (122)  │ │★4.7 (67)   │   │
│  │$45/45min   │ │$89/60min   │ │$150/60min  │   │
│  │●Thu 2pm    │ │●Today 4pm  │ │●Fri 9am    │   │
│  └────────────┘ └────────────┘ └────────────┘   │
│  [Load More...]                                  │
└──────────────────────────────────────────────────┘
```

**States:** Loading (skeleton cards) | Empty ("No services found") | Error (retry) | Success
**Mobile:** Single column, horizontal pill scroll, sticky search

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Search bar | Filters on keystroke (300ms debounce) | N/A | Skeleton cards |
| Category pills | Single-select filter | Blue bg + white text | Cards fade-reload |
| Sort dropdown | Re-sorts cards | Selected shown in label | N/A |
| Service card | Navigate to /book?service={id} | Shadow + blue border on hover | Skeleton placeholder |
| Nav "Services" | Current page | Bold + blue underline | N/A |
| Load More | Fetches next page | Disabled + spinner | N/A |

---

### Screen 2: Booking Wizard — Step 1 (Service + Staff)
**Purpose:** Confirm service, choose staff
**Route:** `/book?service={id}&step=1`
**BRs:** BR-004, BR-005

```
┌──────────────────────────────────────────────────┐
│  [← Back]  Book an Appointment   Step ●──○──○    │
├──────────────────────────────────────────────────┤
│  Deep Tissue Massage · $89 · 60min              │
│  Zen Wellness · ★4.9 (122) · Cancel free 24hrs  │
│                                                  │
│  Choose Therapist (optional)                     │
│  ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ Maria  │ │ James  │ │  Any   │              │
│  │ ★4.9   │ │ ★4.7   │ │  No    │              │
│  │ Next:2p│ │ Next:4p│ │ Pref.  │              │
│  └────────┘ └────────┘ └────────┘              │
│                                                  │
│              [Continue to Date & Time →]          │
└──────────────────────────────────────────────────┘
```

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Staff card | Select therapist | Blue border + checkmark | N/A |
| "No Preference" | Deselect staff | Blue border when selected | N/A |
| Continue | Navigate step 2 | Disabled until service loaded | N/A |
| Step indicator | Shows progress | Filled circle = current | N/A |

---

### Screen 3: Booking Wizard — Step 2 (Date & Time)
**Purpose:** Select date and time slot
**Route:** `/book?service={id}&step=2&date=2026-03-26`
**BRs:** BR-003, BR-004, BR-014

```
┌──────────────────────────────────────────────────┐
│  [← Back]  Book an Appointment   ●──●──○         │
├──────────────────────────────────────────────────┤
│  Select Date & Time                              │
│  Provider: America/New_York (EDT)                │
│                                                  │
│  ◄ Mo  Tu  We [Th] Fr  Sa  Su ►                 │
│    23  24  25 [26] 27  28  29                    │
│                                                  │
│  Thursday, March 26                              │
│  Morning:    [9:00] [9:30] [10:00] [10:30]       │
│  Afternoon:  [1:00] [●2:00] [2:30] [3:00]       │
│  Evening:    [5:00] [5:30]                       │
│                                                  │
│  ⚠ Your time: 11:00 AM PDT (3hrs behind)         │
│                                                  │
│              [Continue to Confirmation →]         │
└──────────────────────────────────────────────────┘
```

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Date cell | Select date, loads slots | Blue bg + white text | Skeleton shimmer on slots |
| Week arrows | Navigate weeks | N/A | Slots reload with skeleton |
| Slot chip | Select time | Blue bg + white text + check | N/A |
| Unavailable slot | Non-interactive | Gray + strikethrough | N/A |
| TZ warning | Shows when user≠provider TZ | Yellow alert | N/A |
| Continue | Step 3 | Disabled until slot selected | N/A |

---

### Screen 4: Booking Wizard — Step 3 (Confirmation)
**Purpose:** Review + provide contact info
**Route:** `/book?service={id}&step=3&slot={start}`
**BRs:** BR-004, BR-005, BR-009

```
┌──────────────────────────────────────────────────┐
│  [← Back]  Book an Appointment   ●──●──●         │
├──────────────────────────────────────────────────┤
│  Confirm Your Booking                            │
│  ┌────────────────────────────────────────┐      │
│  │ Deep Tissue Massage with Maria        │      │
│  │ Thu Mar 26 · 2:00-3:00 PM EDT         │      │
│  │ (11:00 AM-12:00 PM your time PDT)     │      │
│  │ $89.00                                │      │
│  │ Cancel free up to 24hrs before        │      │
│  └────────────────────────────────────────┘      │
│                                                  │
│  Name   [________________________]               │
│  Email  [________________________]               │
│  Phone  [________________________]               │
│  Notes  [Optional: "Focus on lower back"__]      │
│                                                  │
│  □ Create account to manage bookings             │
│                                                  │
│  [Confirm Booking]                               │
│  By confirming, you agree to cancellation policy │
└──────────────────────────────────────────────────┘
```

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Name/Email/Phone | Validate on blur | Red border + error if invalid | N/A |
| Notes | Optional freetext | N/A | N/A |
| Account checkbox | Toggle | Blue checkmark when checked | N/A |
| Confirm button | POST /v1/bookings | Disabled + spinner | "Confirming..." |

---

### Screen 5: Post-Booking Confirmation
**Route:** `/book/confirmed?id={bookingId}`
**BRs:** BR-007, BR-008, BR-015

```
┌──────────────────────────────────────────────────┐
│  [B] BookEasy                                    │
├──────────────────────────────────────────────────┤
│           ✓ Booking Confirmed!                   │
│                                                  │
│  Deep Tissue Massage with Maria                  │
│  Thu Mar 26 · 2:00-3:00 PM EDT                   │
│  Zen Wellness · 123 Main St, NY                  │
│                                                  │
│  [+ Google Calendar] [+ Apple] [+ .ics]          │
│                                                  │
│  What to Expect:                                 │
│  • Arrive 10 min early • Wear comfortable clothes│
│                                                  │
│  [Reschedule]  [Cancel Booking]                  │
│                                                  │
│  Ref: #BK-20260326-A7F3                          │
└──────────────────────────────────────────────────┘
```

---

### Screen 6: Provider Dashboard
**Route:** `/dashboard` (authenticated, provider)
**BRs:** BR-010, BR-011

```
┌──────────────────────────────────────────────────┐
│  [B] BookEasy Provider          [🔔 3]           │
├────────┬─────────────────────────────────────────┤
│Dashboard│ Today · Thursday, March 26              │
│Calendar │                                        │
│Services │ [6 appts] [28 week] [78% util]         │
│Settings │                                        │
│         │  9:00  Sarah K. - Haircut  ★Regular    │
│         │  9:45  ░░░ Buffer ░░░                  │
│         │ 10:00  Mike R. - Color     New         │
│         │ 11:30  ▓▓▓ AVAILABLE ▓▓▓               │
│         │  1:00  Lisa M. - Massage   "lower back"│
│         │                                        │
│         │ [+ Block Time]  [+ Walk-in]            │
└────────┴─────────────────────────────────────────┘
```

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Sidebar nav | Navigate sections | Blue bg + white text on current | N/A |
| Stat cards | Informational | N/A | Skeleton numbers |
| Booking row | Click to expand details | Blue left border expanded | N/A |
| Available slot | Click to block/walk-in | Green background | N/A |

---

## User Flow

**Happy path:** /services → search/filter → click card → step 1 (select staff) → step 2 (pick date+slot) → step 3 (fill form, confirm) → confirmation page → email+SMS within 60s

**Reschedule:** email link → /reschedule/{id}?token={t} → pick new slot → confirm (no login)

**Cancel:** email link → /cancel/{id}?token={t} → confirm (no login) → slot freed

**Errors:** slot taken → "No longer available, select another" + refresh; network → retry button

---

## Technical Notes

### API Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /v1/auth/register | Register | Public |
| POST | /v1/auth/login | Login | Public |
| GET | /v1/services | List/search | Public |
| GET | /v1/services/:id | Detail | Public |
| POST | /v1/services | Create | Provider |
| GET | /v1/availability/slots | Available slots | Public |
| POST | /v1/availability | Create rule | Provider |
| POST | /v1/bookings | Create booking | Public (guest) |
| GET | /v1/bookings/:id | Booking detail | Owner/Provider |
| PATCH | /v1/bookings/:id/cancel | Cancel | Owner/Provider/Token |
| PATCH | /v1/bookings/:id/reschedule | Reschedule | Owner/Provider/Token |
| GET | /v1/providers/:id | Provider profile | Public |

### Data Model
- **Users:** id, email, passwordHash, name, role
- **Providers:** id, userId, businessName, timezone (IANA), settings (JSONB)
- **Services:** id, providerId, name, serviceType, durationMin, priceCents, config (JSONB)
- **AvailabilityRules:** id, providerId, rrule (RFC 5545), timezone, exceptions
- **Bookings:** id, serviceId, providerId, customerId, slotStart/End, status, version, idempotencyKey
- **Customers:** id, userId (nullable for guests), name, email, phone
- **DB:** PostgreSQL row-level locking on slots; transactional outbox for events

### Security
- JWT 15min + refresh rotation in HttpOnly cookie
- ABAC: ResourceOwnerGuard on every mutation
- Token-based cancel/reschedule: HMAC-signed, 7-day expiry
- Rate limiting: 5/60s auth, 20/60s bookings
- ValidationPipe: whitelist + forbidNonWhitelisted
- Medical deferred (no PHI in v1)

---

## Summary

- **Total requirements:** 43
- **MUST:** 18 | **SHOULD:** 11 | **COULD:** 10 | **WON'T:** 4
- **Screens designed:** 6
- **API endpoints:** 12
- **Review v1 additions:** BR-030 to BR-043 (from Performance, SEO, Data, Growth, Tech Writer, AI/ML reviews)
