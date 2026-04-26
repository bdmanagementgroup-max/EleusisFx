# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint (Next.js + TypeScript rules)
```

No test suite is configured.

## Architecture

**Eleusis FX** is a Next.js 16 (App Router) + TypeScript prop firm evaluation platform. It serves both a public marketing site and a protected client/admin portal.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase (auth + PostgreSQL), Notion API, Twelve Data API (forex), CoinGecko API (crypto), Recharts, SWR, Vercel.

### Route Map

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Marketing homepage |
| `/articles`, `/articles/[slug]` | Public | Blog — reads from Supabase `articles` table |
| `/compare` | Public | Prop firm comparison table |
| `/calendar` | Public | Economic calendar (Investing.com iframe) |
| `/links` | Public | Link-in-bio page |
| `/resources` | Public | Educational guides from Supabase |
| `/login` | Public | Supabase auth entry point |
| `/dashboard` | Client | Trading metrics, equity curve, drawdown stats |
| `/admin/*` | Admin | Manage articles, applications, resources, past clients |

### Auth & Role Routing

Supabase auth handles sessions. After login, `app_metadata.role === "admin"` routes to `/admin`; everyone else goes to `/dashboard`. Server-side checks use `getSupabaseServerClient()` from `lib/supabase/server.ts`. Row-level security (RLS) enforces that clients only read their own `client_metrics` and `equity_history` rows. Admin operations bypass RLS via `SUPABASE_SERVICE_ROLE_KEY`.

### Data Flows

- **Lead capture** → `POST /api/leads` → Supabase `leads` table
- **Application form** → `POST /api/applications` → Notion database (primary) + Supabase `applications` table (dual-write)
- **Market data** → `/api/market/forex` (Twelve Data) and `/api/market/crypto` (CoinGecko), cached 60 s
- **Client dashboard** → Supabase `client_metrics` + `equity_history` (RLS per user)
- **Articles / resources** → Admin writes via API routes → frontend reads from Supabase

### Supabase Client Wrappers (`lib/supabase/`)

- `client.ts` — browser-side singleton (client components)
- `server.ts` — server-side clients; use the service-role variant for admin writes

### Key Database Tables

`leads`, `applications`, `articles`, `resources`, `client_metrics`, `equity_history`, `past_clients`

Migration SQL files in the repo root define the full schemas and RLS policies.

### Component Layout

- `components/home/` — landing page sections (Hero, Pricing, FAQ, ApplyForm, etc.)
- `components/layout/` — shared nav, footer, market ticker, custom cursor, WhatsApp float
- `components/dashboard/` — client portal components (equity curve via Recharts)
- `app/admin/` — admin-only pages (CRUD for articles, resources, past clients)

## Important: DEMO Data vs. Live Data

Several admin and dashboard pages still use **hardcoded DEMO arrays** rather than live Supabase reads. Before editing any page, check whether it pulls real data or renders demo constants. Pages known to have been hardcoded as of the April 2026 audit: admin clients list, admin articles list, client dashboard metrics. Newer pages (articles, resources, past-clients) have been wired to Supabase — verify before assuming.

## Environment Variables

Required secrets (see `.env.local.example`):

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
