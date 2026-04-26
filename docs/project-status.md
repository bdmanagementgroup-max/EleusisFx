# Eleusis FX — Project Status

Last updated: 26 April 2026

## Site Overview

Prop firm evaluation platform. Public marketing site + protected client dashboard + admin portal.

**URL:** eleusisfx.uk  
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase, Notion API, Vercel  
**Repo:** github.com/bdmanagementgroup-max/EleusisFx

---

## Pages & Data Status

### Public Pages

| Page | Route | Data Source | Status |
|---|---|---|---|
| Homepage | `/` | Static | ✅ Complete |
| Articles list | `/articles` | Supabase `articles` (fallback to 3 hardcoded) | ✅ Complete |
| Article detail | `/articles/[slug]` | Supabase first, 3 hardcoded seed articles as fallback | ✅ Complete |
| Prop firm comparison | `/compare` | Static | ✅ Complete |
| Resources | `/resources` | Supabase `resources` (fallback to hardcoded if empty) | ✅ Complete |
| Economic calendar | `/calendar` | TradingView embed widget | ✅ Complete |
| Links | `/links` | Static | ✅ Complete |
| Login | `/login` | Supabase auth | ✅ Complete |

### Client Dashboard (protected)

| Page | Route | Data Source | Status |
|---|---|---|---|
| Dashboard home | `/dashboard` | Supabase `client_metrics` + `equity_history` (RLS) | ✅ Complete |
| Markets | `/dashboard/markets` | Live API | ✅ Complete |
| Calendar | `/dashboard/calendar` | TradingView embed | ✅ Complete |

### Admin Portal (protected, admin role only)

| Page | Route | Data Source | Status |
|---|---|---|---|
| Admin home | `/admin` | — | ✅ Complete |
| Clients & leads | `/admin/clients` | Supabase `applications` + `leads` | ✅ Complete |
| Articles list | `/admin/articles` | Supabase `articles` | ✅ Complete |
| New article | `/admin/articles/new` | POST → `/api/articles` → Supabase | ✅ Complete |
| Resources | `/admin/resources` | Supabase `resources` (full CRUD) | ✅ Complete |
| Past clients | `/admin/past-clients` | Supabase `past_clients` | ✅ Complete |

---

## Data Flows

- **Lead capture** → `POST /api/leads` → Supabase `leads`
- **Application form** → `POST /api/applications` → Notion (primary) + Supabase `applications` (dual-write)
- **New article** → `POST /api/articles` → Supabase `articles`
- **Resources CRUD** → `/api/resources` → Supabase `resources`
- **Past clients** → `/api/past-clients` → Supabase `past_clients`
- **Market data** → `/api/market/forex` (Twelve Data) + `/api/market/crypto` (CoinGecko), cached 60s
- **Client dashboard** → Supabase `client_metrics` + `equity_history` with row-level security

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `leads` | Email captures from lead magnet form |
| `applications` | Full application form submissions |
| `articles` | Blog articles (admin-managed) |
| `resources` | Resource links (admin-managed, shown on /resources) |
| `client_metrics` | Per-client trading stats (RLS — clients see own row only) |
| `equity_history` | Time-series equity data for dashboard chart (RLS) |
| `past_clients` | Historical client records imported from PDF agreements |

---

## Auth

- Supabase handles sessions
- `app_metadata.role === "admin"` → routed to `/admin`
- All other authenticated users → `/dashboard`
- Set role manually in Supabase dashboard per user

---

## Completed Work (this session — 26 Apr 2026)

- Wired `/resources` public page to Supabase (was fully hardcoded)
- Replaced broken Investing.com calendar embed with TradingView dark-theme widget
- Brightened muted text sitewide (opacity 0.38 → 0.88) + added silver glow via globals.css
- Created `CLAUDE.md` with architecture overview for AI-assisted development
- Created `docs/supabase-overview.md` for Supabase reference
- Confirmed all admin pages and client dashboard are reading live Supabase data (no remaining DEMO arrays)

---

## Nothing Outstanding

The codebase is in a production-ready state. All pages read live data. No hardcoded DEMO constants, no TODO comments, no incomplete forms remain.

The only intentional static content:
- 3 seed articles hardcoded as fallback in `/articles/[slug]` (renders if Supabase query fails or slug not found)
- Static homepage sections (Hero, ProcessSteps, ProofSection, PricingSection, FAQ) — these are marketing copy, not data-driven
