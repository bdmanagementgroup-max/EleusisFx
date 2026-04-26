# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint (Next.js + TypeScript rules)
```

No test suite is configured. Requires `.env.local` with Supabase + API keys to run locally (see `.env.local.example`).

## Architecture

**Eleusis FX** is a Next.js 16 (App Router) + TypeScript prop firm evaluation platform serving a public marketing site, protected client dashboard, and admin portal.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase (auth + PostgreSQL), Notion API, Twelve Data API (forex), CoinGecko API (crypto), Recharts, SWR, Vercel.

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
| `/dashboard` | Trading metrics, equity curve chart (Recharts), drawdown stats — reads `client_metrics` + `equity_history` (RLS) |
| `/dashboard/markets` | Live market data |
| `/dashboard/calendar` | TradingView calendar |

### Admin Portal (protected — `app_metadata.role === "admin"`)

| Route | Function |
|---|---|
| `/admin` | Admin home |
| `/admin/clients` | View applications + leads from Supabase |
| `/admin/articles` | List, publish/unpublish articles |
| `/admin/articles/new` | Create new article — POST to `/api/articles` → Supabase |
| `/admin/resources` | Full CRUD for resources shown on `/resources` |
| `/admin/past-clients` | View + edit historical client records |

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
- **Past clients** → `/api/past-clients` → Supabase `past_clients`
- **Market data** → `/api/market/forex` (Twelve Data) + `/api/market/crypto` (CoinGecko), 60s server cache

## Auth & Role Routing

Supabase handles sessions. After login, `app_metadata.role === "admin"` routes to `/admin`; all others go to `/dashboard`. Server-side checks use `getSupabaseServerClient()`. Admin operations use `getSupabaseAdminClient()` (service role key, bypasses RLS). Set role in Supabase dashboard per user.

## Supabase Client Wrappers (`lib/supabase/`)

- `client.ts` — browser-side singleton (client components)
- `server.ts` — `getSupabaseServerClient()` for user-session server components; `getSupabaseAdminClient()` for admin/service-role operations

## Key Database Tables

| Table | Purpose |
|---|---|
| `leads` | Email captures |
| `applications` | Application form submissions |
| `articles` | Blog articles (admin-managed) |
| `resources` | Resource links (admin-managed) |
| `client_metrics` | Per-user trading stats (RLS) |
| `equity_history` | Time-series equity for dashboard chart (RLS) |
| `past_clients` | Historical client records — also powers the ProofFeed ticker |

Migration SQL files in repo root define schemas and RLS policies.

## Styling

- **Tailwind CSS 4** with custom theme vars in `globals.css` (`--color-muted`, `--color-accent`, etc.)
- **Inline styles** used throughout — most muted text is `rgba(210,220,240,0.88)`, faint text `rgba(210,220,240,0.58)`
- **Silver glow** on all `p`, `li`, `td`, `th`, `label`, `span` via global `text-shadow` in `globals.css`
- **Scroll animation** — `@keyframes scroll` in `globals.css` (`translateX(-50%)`), reused by Ticker, PublicMarketTicker, and ProofFeedTicker

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
