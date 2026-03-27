<!-- smart-workflows v4.21.0 | company | 2026-03-25 -->
# Business Requirements: Flexible Booking System

**Date:** 2026-03-25
**Status:** APPROVED WITH CONDITIONS
**Source:** Company Perspective Review (`/smart:company`)

---

## MUST Have (v1 -- Launch Blockers)

| ID | Requirement | Source | Owner | Acceptance Criteria |
|----|------------|--------|-------|-------------------|
| BR-001 | Service catalog with search, filter, and sort | UX, Frontend | Frontend | User can browse, search by keyword, filter by category, sort by price/rating/availability |
| BR-002 | Provider availability configuration (weekly hours, buffer time, exceptions) | Backend, CTO | Backend | Provider sets recurring hours via RRULE, adds exception dates, configures buffer time |
| BR-003 | Real-time slot selection for customers | Frontend, End User | Frontend | Customer sees available slots for a date range, slots update within 60s of changes |
| BR-004 | 3-step booking wizard (Service+Provider -> Date/Time -> Confirm) | UX, End User | Frontend | Booking completes in 3 steps max, under 90 seconds for returning users |
| BR-005 | Guest checkout (no account required to book) | End User, UX | Frontend | User books without creating an account; optional account creation post-booking |
| BR-006 | Double-booking prevention at database level | Backend, CTO | Backend | PostgreSQL EXCLUDE USING gist constraint prevents overlapping slots; tested at 50x peak load |
| BR-007 | Booking confirmation via email + SMS | End User, UX | Backend | Confirmation delivered within 3 seconds of booking; includes calendar link |
| BR-008 | Cancel/reschedule via token link (no login required) | End User, Security | Full-stack | Email/SMS contains signed token link; cancellation in under 3 taps from notification |
| BR-009 | Cancellation policy visible before booking confirmation | End User, UX | Frontend | Policy displayed on confirmation step; fee shown if applicable |
| BR-010 | Provider dashboard with today's agenda view | UX, PM | Frontend | Provider sees today's bookings, buffer times, available slots in agenda format |
| BR-011 | Provider onboarding in under 5 minutes | PM, UX | Full-stack | Minimal fields: business name, timezone, first service, hours. Sensible defaults pre-filled |
| BR-012 | JWT auth with short-lived tokens (15min) + refresh tokens | Security | Backend | Access token 15min, refresh in HttpOnly Secure SameSite=Strict cookie |
| BR-013 | ABAC ownership check on all mutation endpoints | Security | Backend | cancel, reschedule, update endpoints verify requesting user owns the resource |
| BR-014 | Timezone handling: UTC storage + IANA timezone display | CTO, UX | Full-stack | All times stored UTC with IANA tz string; mismatch warning shown when user/provider TZs differ |

## SHOULD Have (v1 -- Ship if capacity allows)

| ID | Requirement | Source | Owner | Acceptance Criteria |
|----|------------|--------|-------|-------------------|
| BR-015 | Calendar integration (.ics download, Google Calendar, Apple Calendar) | End User | Frontend | Confirmation page offers all 3 calendar add options |
| BR-016 | Configurable reminders (24h, 2h before, customizable) | End User, PM | Backend | Provider configures reminder timing; customer receives via email + SMS |
| BR-017 | Customer dashboard (upcoming, past, favorites) | UX | Frontend | Customer sees upcoming bookings with reschedule/cancel, past with rebook option |
| BR-018 | Pre-appointment "what to expect" message | End User | Backend | Sent 24h before appointment with provider-configured instructions |
| BR-019 | Post-service review request | PM | Backend | Sent 2h after appointment end time |
| BR-020 | Idempotency on booking creation | Backend | Backend | X-Idempotency-Key header prevents duplicate bookings on retry |

## COULD Have (v1.1 -- Next iteration)

| ID | Requirement | Source | Owner | Acceptance Criteria |
|----|------------|--------|-------|-------------------|
| BR-021 | Staff/resource management per provider | PM | Backend | Multiple staff with individual availability per provider account |
| BR-022 | Recurring appointments | PM | Backend | Customer books weekly/biweekly recurring slots |
| BR-023 | Payment integration (Stripe) | PM, Security | Full-stack | PCI-compliant via Stripe Elements; collect at booking or at service |
| BR-024 | Analytics dashboard for providers | PM | Frontend | Utilization rate, no-show rate, booking trends |
| BR-025 | Waitlist management | PM | Backend | Customer joins waitlist for fully-booked slots; notified on cancellation |

## WON'T Have (Explicitly deferred)

| ID | Requirement | Reason Deferred | Revisit When |
|----|------------|-----------------|-------------|
| BR-026 | Medical vertical (HIPAA compliance) | HIPAA BAAs, PHI encryption, audit logging scope too large for v1 | After v1 PMF proven |
| BR-027 | Multi-location support | Adds multi-tenancy complexity | After single-location is validated |
| BR-028 | Consumer discovery/marketplace | Two-sided marketplace is a different product | After provider retention > 60% |
| BR-029 | Mobile native app | Web responsive is sufficient for v1 | After 10K monthly bookings |

---

## Screen Designs

### Screen 1: Service Catalog
**Purpose:** Browse and discover available services
**Route:** `/services`
**BRs covered:** BR-001, BR-005

```
+----------------------------------------------------------+
|  [B] BookEasy        [Search...]       [Log In] [Sign Up] |
|  ● Services  ○ How It Works                              |
+----------------------------------------------------------+
|                                                          |
|  Browse Services                                         |
|  Find and book trusted providers near you                |
|                                                          |
|  [🔍 Search services, providers...________________]      |
|  [Sort: Recommended ▼]                                   |
|                                                          |
|  [● All] [○ Beauty] [○ Wellness] [○ Fitness] [○ Home]   |
|                                                          |
|  9 services found                                        |
|                                                          |
|  +------------------+  +------------------+              |
|  | [JS] Haircut     |  | [ZW] Deep Tissue |              |
|  | Jane's Salon     |  | Zen Wellness     |              |
|  | ★★★★☆ 4.8 (48)   |  | ★★★★★ 4.9 (122) |              |
|  | $45 / 45min      |  | $89 / 60min      |              |
|  | ● Next: Thu 2pm  |  | ● Next: Today 4pm|              |
|  +------------------+  +------------------+              |
|                                                          |
|  +------------------+  +------------------+              |
|  | [FP] Plumbing    |  | [FL] Personal    |              |
|  | Fix-It Pro       |  | Training         |              |
|  | ★★★★☆ 4.7 (67)   |  | FitLife Gym      |              |
|  | $150 / 60min     |  | $75 / 60min      |              |
|  | ● Next: Fri 9am  |  | ● Next: Tmrw 7am |              |
|  +------------------+  +------------------+              |
|                                                          |
|  [Load More...]                                          |
+----------------------------------------------------------+
```

**Fields:**
| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| Search | text | no | min 2 chars | Filters by service name + provider name |
| Category | pill selector | no | single select | Filters service list by category |
| Sort | dropdown | no | enum | Recommended, Price Low-High, Price High-Low, Rating, Next Available |

**States:** Loading (skeleton cards) | Empty ("No services found. Try a different search.") | Error (retry banner) | Success (card grid)
**Mobile (375px):** Single column cards, horizontal scrollable category pills, sticky search bar

**Interactivity spec (REQUIRED):**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Search bar | Filters card grid on keystroke (debounced 300ms) | N/A | Skeleton cards while filtering |
| Category pills | Filters by category, single select | Blue bg + white text when selected, gray when not | Cards fade-reload on switch |
| Sort dropdown | Re-sorts visible cards | Selected option shown in dropdown label | N/A |
| Service card | Navigate to `/book?service={id}` | Elevated shadow + blue border on hover, scale 1.02 | Skeleton card placeholder |
| Nav item "Services" | Current page | Bold + blue underline | N/A |
| Load More button | Loads next page of results | Disabled + spinner while loading | N/A |

---

### Screen 2: Booking Wizard -- Step 1: Service + Provider
**Purpose:** Confirm service selection and choose staff
**Route:** `/book?service={id}&step=1`
**BRs covered:** BR-004, BR-005

```
+----------------------------------------------------------+
|  [< Back]   Book an Appointment     Step ●───○───○       |
+----------------------------------------------------------+
|                                                          |
|  Selected Service                                        |
|  ┌──────────────────────────────────────────────────┐    |
|  │  Deep Tissue Massage · $89 · 60min              │    |
|  │  Zen Wellness Center                             │    |
|  │  ★★★★★ (122) · Cancel free up to 24hrs          │    |
|  └──────────────────────────────────────────────────┘    |
|                                                          |
|  Choose Your Therapist (optional)                        |
|  ┌──────────┐  ┌──────────┐  ┌──────────┐              |
|  │ [Photo]  │  │ [Photo]  │  │  [Any]   │              |
|  │ Maria    │  │ James    │  │  No      │              |
|  │ ★★★★★    │  │ ★★★★☆    │  │  Pref.   │              |
|  │ Next:2pm │  │ Next:4pm │  │          │              |
|  └──────────┘  └──────────┘  └──────────┘              |
|                                                          |
|                     [Continue to Date & Time →]          |
+----------------------------------------------------------+
```

**States:** Loading (skeleton) | Error (service not found) | Success
**Mobile (375px):** Full-width staff cards stacked vertically

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Back button | Navigate to `/services` | N/A | N/A |
| Staff card | Select this staff member | Blue border + checkmark badge | N/A |
| "No Preference" card | Deselect staff | Blue border when selected | N/A |
| Continue button | Navigate to step 2 | Disabled if service not loaded | N/A |
| Step indicator | Shows progress | Filled circle for current step | N/A |

---

### Screen 3: Booking Wizard -- Step 2: Date & Time
**Purpose:** Select appointment date and time slot
**Route:** `/book?service={id}&staff={id}&step=2&date=2026-03-26`
**BRs covered:** BR-003, BR-004, BR-014

```
+----------------------------------------------------------+
|  [< Back]   Book an Appointment     ●───●───○            |
+----------------------------------------------------------+
|                                                          |
|  Select Date & Time                                      |
|  Provider timezone: America/New_York (EDT)               |
|                                                          |
|  ◄ Mo  Tu  We [Th] Fr  Sa  Su ►    ← week view         |
|    23  24  25 [26] 27  28  29                            |
|                                                          |
|  Thursday, March 26                                      |
|  ┌──────────────────────────────────────────┐            |
|  │  Morning                                 │            |
|  │  [9:00] [9:30] [10:00] [10:30] [11:00]  │            |
|  │                                          │            |
|  │  Afternoon                               │            |
|  │  [1:00] [●2:00] [2:30] [3:00] [3:30]    │ ← selected |
|  │                                          │            |
|  │  Evening                                 │            |
|  │  [5:00] [5:30]                           │            |
|  └──────────────────────────────────────────┘            |
|                                                          |
|  ⚠ Your timezone: America/Los_Angeles (PDT)              |
|    This is 11:00 AM your time                            |
|                                                          |
|                         [Continue to Confirmation →]     |
+----------------------------------------------------------+
```

**States:** Loading (skeleton slot grid) | Empty ("No availability this week") | Error | Success
**Mobile (375px):** Horizontal scrollable date strip, vertical slot list, sticky continue button

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Date cell | Select date, loads slots | Blue bg + white text | Slots show skeleton shimmer |
| Week nav arrows | Shift week forward/back | N/A | Slots reload with skeleton |
| Time slot chip | Select time | Blue bg + white text + checkmark | N/A |
| Unavailable slot | Non-interactive | Gray bg + strikethrough text | N/A |
| Timezone warning | Shown when user TZ differs from provider TZ | Yellow bg alert | N/A |
| Continue button | Navigate to step 3 | Disabled until slot selected | N/A |

---

### Screen 4: Booking Wizard -- Step 3: Confirmation
**Purpose:** Review booking details and provide contact info
**Route:** `/book?service={id}&staff={id}&step=3&slot={start}`
**BRs covered:** BR-004, BR-005, BR-009

```
+----------------------------------------------------------+
|  [< Back]   Book an Appointment     ●───●───●            |
+----------------------------------------------------------+
|                                                          |
|  Confirm Your Booking                                    |
|  ┌──────────────────────────────────────────────────┐    |
|  │  Deep Tissue Massage with Maria                  │    |
|  │  Thu, March 26, 2026                             │    |
|  │  2:00 PM - 3:00 PM (EDT)                        │    |
|  │  11:00 AM - 12:00 PM your time (PDT)            │    |
|  │  $89.00                                          │    |
|  │                                                  │    |
|  │  Cancellation: Free up to 24hrs before           │    |
|  └──────────────────────────────────────────────────┘    |
|                                                          |
|  Your Details                                            |
|  Name   [________________]                               |
|  Email  [________________]                               |
|  Phone  [________________]                               |
|  Notes  [Add a note for your provider...______]          |
|                                                          |
|  □ Create an account to manage bookings easily           |
|                                                          |
|  [Confirm Booking]                                       |
|  By confirming, you agree to the cancellation policy.    |
+----------------------------------------------------------+
```

**Fields:**
| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| Name | text | yes | min 1, max 255 | BR-004 |
| Email | email | yes | valid email | BR-007 |
| Phone | tel | yes | min 7, max 20 | BR-007 |
| Notes | textarea | no | max 1000 | Placeholder: "Focus on lower back" |

**States:** Loading | Submitting (spinner in button) | Error (inline field errors + API error banner) | Success (redirect to confirmation page)
**Mobile (375px):** Single column, sticky confirm button at bottom

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Name/Email/Phone inputs | Validate on blur | Red border + error message on invalid | N/A |
| Notes textarea | Optional freetext | N/A | N/A |
| Account checkbox | Toggle account creation | Checked = blue checkmark | N/A |
| Confirm button | Submit booking via POST /v1/bookings | Disabled + spinner while submitting | "Confirming..." text |
| Cancel policy text | Informational | N/A | N/A |

---

### Screen 5: Post-Booking Confirmation
**Purpose:** Confirm booking success, provide next steps
**Route:** `/book/confirmed?id={bookingId}`
**BRs covered:** BR-007, BR-008, BR-015

```
+----------------------------------------------------------+
|  [B] BookEasy                                            |
+----------------------------------------------------------+
|                                                          |
|  ✓ Booking Confirmed!                                    |
|                                                          |
|  Deep Tissue Massage with Maria                          |
|  Thu, March 26, 2026 · 2:00 PM - 3:00 PM (EDT)          |
|  Zen Wellness · 123 Main St, New York, NY                |
|                                                          |
|  ┌──────────────────────────────────────────┐            |
|  │  [+ Add to Google Calendar]              │            |
|  │  [+ Add to Apple Calendar]               │            |
|  │  [+ Download .ics]                       │            |
|  └──────────────────────────────────────────┘            |
|                                                          |
|  What to Expect                                          |
|  • Arrive 10 minutes early                              |
|  • Wear comfortable clothing                            |
|  • Contact: (555) 123-4567                              |
|                                                          |
|  [Reschedule]  [Cancel Booking]                          |
|                                                          |
|  Confirmation sent to: email + phone                     |
|  Ref: #BK-20260326-A7F3                                  |
+----------------------------------------------------------+
```

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Google Calendar button | Opens Google Calendar deep link in new tab | N/A | N/A |
| Apple Calendar button | Triggers webcal:// download | N/A | N/A |
| .ics button | Downloads .ics file | N/A | N/A |
| Reschedule button | Navigate to `/reschedule/{id}?token={token}` | N/A | N/A |
| Cancel button | Navigate to `/cancel/{id}?token={token}` | Red text on hover | N/A |

---

### Screen 6: Provider Dashboard
**Purpose:** Provider's daily agenda and quick actions
**Route:** `/dashboard` (authenticated, provider role)
**BRs covered:** BR-010, BR-011

```
+----------------------------------------------------------+
|  [B] BookEasy Provider      [🔔 3]                       |
+----------------------------------------------------------+
|  | Dashboard  |                                          |
|  | Calendar   |  Today · Thursday, March 26              |
|  | Services   |                                          |
|  | Settings   |  ┌────────┐ ┌────────┐ ┌────────┐       |
|  |            |  │ Today  │ │ Week   │ │ Util.  │       |
|  |            |  │ 6 appt │ │ 28     │ │ 78%    │       |
|  |            |  └────────┘ └────────┘ └────────┘       |
|  |            |                                          |
|  |            |  Today's Schedule                        |
|  |            |  ┌────────────────────────────────┐      |
|  |            |  │ 9:00 │ Sarah K. - Haircut      │      |
|  |            |  │      │ ★ Regular · "trim only"  │      |
|  |            |  ├──────┼─────────────────────────┤      |
|  |            |  │ 9:45 │ ░░░ Buffer ░░░          │      |
|  |            |  ├──────┼─────────────────────────┤      |
|  |            |  │10:00 │ Mike R. - Color & Cut   │      |
|  |            |  │      │ New · no notes           │      |
|  |            |  ├──────┼─────────────────────────┤      |
|  |            |  │11:30 │ ▓▓▓ AVAILABLE ▓▓▓       │      |
|  |            |  ├──────┼─────────────────────────┤      |
|  |            |  │ 1:00 │ Lisa M. - Deep Tissue   │      |
|  |            |  │      │ "Focus on lower back"    │      |
|  |            |  └────────────────────────────────┘      |
|  |            |                                          |
|  |            |  [+ Block Time]  [+ Walk-in]             |
+----------------------------------------------------------+
```

**Interactivity spec:**
| Element | Behavior | Active/Selected State | Loading State |
|---------|----------|----------------------|---------------|
| Sidebar nav items | Navigate between sections | Blue bg + white text on current page | N/A |
| Stat cards | Informational | N/A | Skeleton number placeholders |
| Booking row | Click to expand details (customer contact, notes, actions) | Expanded row with blue left border | N/A |
| Available slot | Click to block time or add walk-in | Green background | N/A |
| Block Time button | Opens time block modal | N/A | N/A |
| Walk-in button | Opens quick-add booking form | N/A | N/A |
| Notification bell | Opens notification dropdown | Red badge with count | N/A |

### Component Legend

```
[________________]     Text input
[Select option  ▼]     Dropdown / select
[____]                 Short/masked input
□ Label                Checkbox
○ Label                Radio button
[Button Label →]       Primary action button
[← Button Label]       Secondary/back button
● Active tab           Active step/tab
○ Inactive tab         Inactive step/tab
├───────────────┤      Section divider
{N} items              Count indicator
[🔍___________]        Search input
★★★★☆                  Star rating
```

---

## User Flow

**Happy path (customer booking):**
1. User opens `/services` -> sees card grid with prices, ratings, next availability
2. Searches or filters by category -> cards filter in real-time
3. Clicks a service card -> navigates to `/book?service={id}&step=1`
4. Optionally selects a staff member -> clicks Continue
5. Selects a date from the week view -> available slots load
6. Selects a time slot -> timezone warning shown if applicable -> clicks Continue
7. Enters name, email, phone, optional notes -> clicks Confirm Booking
8. Redirected to confirmation page -> email + SMS sent within 3 seconds
9. Clicks "Add to Google Calendar" -> event added

**Reschedule (from email link):**
1. User clicks reschedule link in email -> `/reschedule/{id}?token={token}`
2. Sees current booking details + time slot picker (no login required)
3. Selects new date/time -> clicks Confirm Reschedule
4. Original booking marked "rescheduled", new booking created with same context

**Cancel (from email link):**
1. User clicks cancel link in email -> `/cancel/{id}?token={token}`
2. Sees booking details + cancellation policy reminder (no login required)
3. Clicks Confirm Cancellation -> booking cancelled, slot freed

**Error paths:**
- Slot taken mid-flow: "This time slot is no longer available. Please select another." + slots refresh
- Payment failure (v1.1): "Payment could not be processed. Your booking is not confirmed." + retry option
- Network error: "Something went wrong. Please try again." + retry button

---

## Technical Notes

### API Endpoints (from Backend/CTO)
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /v1/auth/register | Register user | Public |
| POST | /v1/auth/login | Login | Public |
| GET | /v1/services | List/search services | Public |
| GET | /v1/services/:id | Service detail | Public |
| POST | /v1/services | Create service | Provider |
| PATCH | /v1/services/:id | Update service | Provider (owner) |
| GET | /v1/availability/slots | Get available slots for date range | Public |
| POST | /v1/availability | Create availability rule | Provider |
| POST | /v1/bookings | Create booking (idempotency key) | Public (guest) |
| GET | /v1/bookings/:id | Get booking detail | Owner/Provider |
| PATCH | /v1/bookings/:id/cancel | Cancel booking | Owner/Provider/Token |
| PATCH | /v1/bookings/:id/reschedule | Reschedule booking | Owner/Provider/Token |
| GET | /v1/providers/:id | Provider public profile | Public |
| PATCH | /v1/providers/:id | Update provider | Provider (owner) |

### Data Model (from Backend)
- **Users**: id, email, passwordHash, name, role (customer/provider/admin)
- **Providers**: id, userId, businessName, timezone (IANA), settings (JSONB with defaults)
- **Services**: id, providerId, name, serviceType, durationMin, priceCents, config (JSONB)
- **AvailabilityRules**: id, providerId, rrule (RFC 5545), timezone, exceptions (JSONB)
- **Bookings**: id, serviceId, providerId, customerId, slotStart/End (TSTZRANGE), status, version (optimistic lock), idempotencyKey
- **Customers**: id, userId (nullable for guests), name, email, phone
- DB constraint: `EXCLUDE USING gist (provider_id WITH =, tstzrange(slot_start, slot_end) WITH &&) WHERE (status NOT IN ('cancelled', 'no_show', 'rescheduled'))`

### Security (from Security Engineer)
- JWT: 15min access token, opaque refresh in HttpOnly Secure SameSite=Strict cookie
- ABAC: ResourceOwnerGuard on every mutation endpoint
- Token-based cancel/reschedule: HMAC-signed with booking ID + action + 7-day expiry
- Rate limiting: 5 req/60s on auth, 20 req/60s on booking creation
- Global ValidationPipe: whitelist: true, forbidNonWhitelisted: true
- Medical vertical deferred (HIPAA) -- no PHI in v1

### Infrastructure (from DevOps/CTO)
- Monorepo: Turborepo with /apps/api (NestJS), /apps/web (Next.js), /packages/shared (types, schemas)
- Database: PostgreSQL 16 with btree_gist extension
- Cache: Redis for availability caching (60s TTL) + reservation leases (5min TTL)
- Shared validation: Zod schemas in /packages/shared consumed by both NestJS pipes and Next.js forms

---

## Summary

- **Total requirements:** 29
- **MUST:** 14 | **SHOULD:** 6 | **COULD:** 5 | **WON'T:** 4
- **Screens designed:** 6
- **API endpoints:** 14
