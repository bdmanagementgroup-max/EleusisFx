# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint (Next.js + TypeScript rules)
```

No test suite is configured. Requires `.env.local` with Supabase + API keys to run locally (see `.env.local.example`).

**Known local build quirk:** `/resources` fails to prerender at build time if `NEXT_PUBLIC_SUPABASE_URL` is not set in `.env.local`. This is not a code bug — it builds and runs correctly in production (Vercel) where env vars are present.

**Known Supabase schema quirk:** The `applications` table was created from an older migration and may be missing columns. If `/admin/clients` shows a DB error or is empty, run this in the Supabase SQL editor:
```sql
ALTER TABLE applications ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE applications ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS notes text;
```

## Architecture

**Eleusis FX** is a Next.js 16 (App Router) + TypeScript prop firm evaluation platform serving a public marketing site, protected client dashboard, and admin portal.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase (auth + PostgreSQL), Notion API, Twelve Data API (forex), CoinGecko API (crypto), Recharts, SWR, Vercel.

## Proxy / Middleware

Auth routing is handled by `proxy.ts` at the repo root (Next.js 16.2.4 renamed `middleware.ts` → `proxy.ts`; the exported function must be named `proxy`, not `middleware`). It:

- Redirects unauthenticated users away from `/dashboard/*` and `/admin/*` to `/login`
- Redirects authenticated non-admins away from `/admin/*` to `/dashboard`
- Redirects logged-in users away from `/login` to their home route

The matcher covers `/dashboard/:path*`, `/admin/:path*`, and `/login`.

**All protected API routes also perform their own server-side auth check** (defence-in-depth) using `getSupabaseServerClient()` + `user.app_metadata?.role !== "admin"` before touching any data.

## Full Site Function Map

### Public Pages

| Route | Component(s) | Function |
|---|---|---|
| `/` | `Hero`, `Ticker`, `StatsRow`, `ProcessSteps`, `ProofSection`, `ProofFeed`, `PricingSection`, `LeadMagnet`, `FaqSection`, `ApplyForm` | Marketing homepage |
| `/articles` | `app/articles/page.tsx` | Blog list — Supabase `articles`, fallback to 3 hardcoded |
| `/articles/[slug]` | `app/articles/[slug]/page.tsx` | Article detail — Supabase first, 3 hardcoded fallbacks |
| `/compare` | `app/compare/page.tsx` | Static prop firm comparison table |
| `/resources` | `app/resources/page.tsx` | Resource links — Supabase `resources`, fallback to hardcoded |
| `/resources/position-size-calculator` | Interactive calculator | Lot size from balance, risk %, stop loss, pip value |
| `/resources/risk-reward-calculator` | Interactive calculator | R:R ratio calculator |
| `/resources/drawdown-tracker` | Interactive calculator | Drawdown vs FTMO limits |
| `/calendar` | `EconomicCalendarWidget` | TradingView economic calendar embed (dark theme) |
| `/links` | Static | Link-in-bio page |
| `/login` | Supabase auth | Login entry point |

### Client Dashboard (protected — any authenticated user)

| Route | Function |
|---|---|
| `/dashboard` | Trading metrics, equity curve chart, drawdown stats — reads `client_metrics` + `equity_history` (RLS) |
| `/dashboard/markets` | Live market data |
| `/dashboard/calendar` | TradingView calendar |

### Admin Portal (protected — `app_metadata.role === "admin"`)

| Route | Function |
|---|---|
| `/admin` | Overview tiles linking to all admin sections |
| `/admin/clients` | Applications list (status, notes, delete, password reset) + leads list (delete) + "New Client" button |
| `/admin/clients/new` | Create client auth account + seed `client_metrics` |
| `/admin/articles` | List articles, toggle publish/unpublish |
| `/admin/articles/new` | Create new article → `POST /api/articles` → Supabase |
| `/admin/resources` | Full CRUD for resources shown on `/resources` |
| `/admin/past-clients` | View + edit historical client records (email, phone, notes, challenge result passed/failed) |
| `/admin/metrics` | Aggregate performance summary + per-client metrics editor (all active accounts) |
| `/admin/metrics/[userId]` | Per-client detail: equity curve, stat cards, progress bars, add equity entry, full metrics edit form |

### Admin API Endpoints

All admin API routes require an authenticated session with `app_metadata.role === "admin"` or return 403.

| Endpoint | Method(s) | Function |
|---|---|---|
| `/api/admin/metrics` | PATCH | Update `client_metrics` for a given `user_id` |
| `/api/admin/create-client` | POST | Create auth user + seed `client_metrics`; rolls back on failure |
| `/api/admin/reset-password` | POST | Generate Supabase recovery link for a client email |
| `/api/admin/equity` | POST | Upsert row in `equity_history` (conflict on `user_id,recorded_at`) |
| `/api/applications` | PATCH, DELETE | Update status/notes or delete an application (POST is public — website form) |
| `/api/leads` | DELETE | Delete a lead (POST is public — email capture) |
| `/api/past-clients` | PATCH | Update editable fields on a past client record (GET is admin-behind-middleware) |
| `/api/articles` | POST | Create article (GET is public — article list page) |
| `/api/resources` | POST, PATCH | Create or toggle active on a resource (GET is public) |

### Homepage Components Detail

- **PublicMarketTicker** — Fixed top bar, live forex + crypto prices (Twelve Data + CoinGecko, 60s cache)
- **Hero** — Main headline "We Pass / Your Prop / Challenge."
- **Ticker** — Scrolling feature highlights strip
- **StatsRow** — Key statistics
- **ProcessSteps** — How the service works
- **ProofSection** — 3-card static proof grid
- **ProofFeed** — Live scrolling ticker of past client wins from Supabase `past_clients` (gracefully hides if DB unavailable)
- **PricingSection** — Pricing tiers
- **LeadMagnet** — Email capture → Supabase `leads`
- **ApplyForm** — Full application → Notion + Supabase `applications`

## Data Flows

- **Lead capture** → `POST /api/leads` → Supabase `leads`
- **Application form** → `POST /api/applications` → Notion (primary) + Supabase `applications` (dual-write)
- **New article** → `POST /api/articles` → Supabase `articles`
- **Resources CRUD** → `/api/resources` → Supabase `resources`
- **Past clients edit** → `PATCH /api/past-clients` → Supabase `past_clients`
- **Client metrics edit** → `PATCH /api/admin/metrics` → Supabase `client_metrics`
- **Equity history** → `POST /api/admin/equity` → Supabase `equity_history` (upsert)
- **Create client** → `POST /api/admin/create-client` → Supabase auth + `client_metrics`
- **Market data** → `/api/market/forex` (Twelve Data) + `/api/market/crypto` (CoinGecko), 60s server cache

## Auth & Role Routing

Supabase handles sessions. After login, `app_metadata.role === "admin"` routes to `/admin`; all others go to `/dashboard`. 

- Page-level protection: `proxy.ts` (runs on every request matching the config)
- API-level protection: each admin API route calls `getSupabaseServerClient()` and checks `user.app_metadata?.role !== "admin"` before any DB operation
- Server components: use `getSupabaseServerClient()` for user-scoped queries (respects RLS)
- Admin operations: use `getSupabaseAdminClient()` (service role key, bypasses RLS)

Set a user's role via Supabase dashboard: Authentication → Users → Edit user → app_metadata → `{ "role": "admin" }`.

## Supabase Client Wrappers (`lib/supabase/`)

- `client.ts` — browser-side singleton (`getSupabaseBrowserClient()`) for client components
- `server.ts` — `getSupabaseServerClient()` for user-session server components + API routes; `getSupabaseAdminClient()` for service-role operations

## Key Database Tables

| Table | Key Columns | Purpose |
|---|---|---|
| `leads` | `email`, `source` | Email captures from homepage |
| `applications` | `first_name`, `last_name`, `email`, `prop_firm`, `status`, `notes` | Application form submissions |
| `articles` | `slug`, `title`, `excerpt`, `category`, `content`, `published`, `published_at`, `read_time` | Blog articles |
| `resources` | `category`, `title`, `url`, `description`, `active` | Resource links |
| `client_metrics` | `user_id`, `prop_firm`, `phase`, `phase_status`, `balance`, `equity`, `daily_drawdown`, `max_drawdown`, `profit_target`, `profit_goal`, `days_used`, `days_allowed` | Per-user trading stats (RLS) |
| `equity_history` | `user_id`, `recorded_at`, `equity` | Time-series equity for chart (RLS); unique on `user_id,recorded_at` |
| `past_clients` | `name`, `email`, `phone`, `address`, `account_size_usd`, `fee_paid_gbp`, `challenge`, `notes`, `source_file`, `challenge_result` | Historical client records + ProofFeed ticker |

Migration SQL files in repo root define schemas and RLS policies. `seed-content.sql` seeds articles, resources, and adds the `challenge_result` column to `past_clients`.

## Styling

- **Tailwind CSS 4** with custom theme vars in `globals.css` (`--color-muted`, `--color-accent`, etc.)
- **Inline styles** used throughout — most muted text is `rgba(210,220,240,0.88)`, faint text `rgba(210,220,240,0.58)`
- **Silver glow** on all `p`, `li`, `td`, `th`, `label`, `span` via global `text-shadow` in `globals.css`
- **Scroll animation** — `@keyframes scroll` in `globals.css` (`translateX(-50%)`), reused by Ticker, PublicMarketTicker, and ProofFeedTicker
- **Admin UI pattern** — dark `#08090f` panels, `1px solid rgba(255,255,255,0.06)` borders, `#4f8ef7` blue accent, `#22c55e` green for pass/positive, `#ef4444` red for fail/negative

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NOTION_API_KEY
NOTION_LEADS_DATABASE_ID
TWELVE_DATA_API_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_WA_NUMBER
```
