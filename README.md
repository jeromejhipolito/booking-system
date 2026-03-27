# BookIt — Online Booking System

A full-stack booking platform built with **Next.js 14** + **NestJS** + **PostgreSQL**.

Features a **demo mode** for portfolio showcase — runs entirely on the frontend with simulated data, no backend or database required.

## Live Demo

Set `NEXT_PUBLIC_DEMO_MODE=true` to run the frontend with simulated data. Switch between Customer and Provider views using the floating demo toggle.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Zustand, TanStack Query
- **Backend:** NestJS, TypeORM, PostgreSQL, JWT, bcrypt, CQRS
- **Monorepo:** pnpm workspaces + Turborepo
- **Shared Packages:** Types, Zod schemas, constants, utilities

## Features

- 3-step booking wizard (Service → Date/Time → Confirm)
- Auth system with JWT (login, register, route protection)
- Auth-aware header with user menu dropdown
- Provider dashboard with onboarding wizard
- Customer "My Bookings" with reschedule/cancel
- Review & rating system with star ratings
- Service address/location display
- Hero search bar with category quick links
- Demo mode toggle (Customer / Provider views)
- Warm coral design system, fully responsive

## Project Structure

```
booking-system/
├── apps/
│   ├── api/           # NestJS backend (port 3001)
│   └── web/           # Next.js frontend (port 3002)
├── packages/
│   ├── shared-types/
│   ├── shared-schemas/
│   ├── shared-constants/
│   └── shared-utils/
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## Deploy to Vercel (Frontend Only — Demo Mode)

This deploys **only the Next.js frontend** with demo mode enabled. No backend or database needed.

### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjeromejhipolito%2Fbooking-system&env=NEXT_PUBLIC_DEMO_MODE&envDescription=Set%20to%20true%20for%20demo%20mode&envLink=https%3A%2F%2Fgithub.com%2Fjeromejhipolito%2Fbooking-system%23demo-mode&project-name=booking-system&root-directory=apps/web)

### Option B: Manual Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo: `jeromejhipolito/booking-system`
3. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && pnpm install && pnpm --filter @booking/shared-types build && pnpm --filter @booking/shared-schemas build && pnpm --filter @booking/shared-constants build && pnpm --filter @booking/shared-utils build && cd apps/web && npx next build`
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`
4. Add Environment Variable:
   - `NEXT_PUBLIC_DEMO_MODE` = `true`
5. Click **Deploy**

### Option C: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# From the project root
cd booking-system

# Login
vercel login

# Deploy (follow prompts)
vercel --build-env NEXT_PUBLIC_DEMO_MODE=true

# When prompted:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? booking-system
# - In which directory is your code located? apps/web
# - Override settings? Yes
#   - Build Command: cd ../.. && pnpm install && pnpm --filter @booking/shared-types build && pnpm --filter @booking/shared-schemas build && pnpm --filter @booking/shared-constants build && pnpm --filter @booking/shared-utils build && cd apps/web && npx next build

# Deploy to production
vercel --prod --build-env NEXT_PUBLIC_DEMO_MODE=true
```

### Important: Monorepo Build Config

Since this is a monorepo, Vercel needs to build shared packages before the frontend. The build command chains:

```
pnpm install →
  build shared-types →
  build shared-schemas →
  build shared-constants →
  build shared-utils →
  next build
```

If you see import errors, ensure the **Root Directory** is set to `apps/web` and the **Build Command** includes the shared package builds above.

---

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL — only needed with backend)

### Frontend Only (Demo Mode)

```bash
# Install dependencies
pnpm install

# Create env file
echo "NEXT_PUBLIC_DEMO_MODE=true" > apps/web/.env.local

# Start frontend
cd apps/web && npx next dev --port 3002
```

Visit http://localhost:3002

### Full Stack (with Backend)

```bash
# 1. Start databases
docker compose up -d

# 2. Run migration
docker exec -i booking-postgres psql -U booking_user -d booking_system < apps/api/src/database/migrations/001-initial-schema.sql

# 3. Build shared packages
for pkg in shared-types shared-schemas shared-constants shared-utils; do
  cd packages/$pkg && npx tsc -p tsconfig.build.json && cd ../..
done

# 4. Build & start API
cd apps/api && npx nest build && node dist/apps/api/src/main.js &

# 5. Start frontend (without demo mode)
echo "NEXT_PUBLIC_DEMO_MODE=false" > apps/web/.env.local
cd apps/web && npx next dev --port 3002
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Enable demo mode (no backend needed) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/v1` | Backend API URL |
| `DATABASE_HOST` | `localhost` | PostgreSQL host |
| `DATABASE_PORT` | `5432` | PostgreSQL port |
| `DATABASE_NAME` | `booking_system` | Database name |
| `DATABASE_USER` | `booking_user` | Database user |
| `DATABASE_PASSWORD` | `booking_pass` | Database password |
| `JWT_SECRET` | `change-me` | JWT signing secret |

---

## Demo Mode

When `NEXT_PUBLIC_DEMO_MODE=true`:

- Auto-logged in as demo user (no real auth needed)
- 9 demo services with images, ratings, addresses
- 4 demo bookings (upcoming + past)
- 5 demo reviews with star ratings
- All API calls intercepted — no backend needed
- Floating toggle to switch between Customer / Provider views
- "Live demo" banner at top with GitHub source link
- Zero cost to host (static frontend only)

When `NEXT_PUBLIC_DEMO_MODE=false`:

- All data comes from the real backend API
- Full auth flow (register, login, JWT)
- Real booking creation with PostgreSQL
- Requires running API + database

---

## API Documentation

Start the API, then visit: http://localhost:3001/api-docs
