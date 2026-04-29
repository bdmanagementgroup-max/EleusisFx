# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint (Next.js + TypeScript rules)
```

No test suite is configured. Requires `.env.local` with Supabase + API keys to run locally.

**Known local build quirk:** `/resources` fails to prerender at build time if `NEXT_PUBLIC_SUPABASE_URL` is not set in `.env.local`. Works correctly in Vercel production.

**Known Supabase schema quirk:** If `/admin/clients` shows a DB error, run in Supabase SQL editor:
```sql
ALTER TABLE applications ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE applications ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS notes text;
```

## Architecture

**Eleusis FX** is a Next.js 16 (App Router) + TypeScript prop firm evaluation platform serving a public marketing site, protected client dashboard, and admin portal.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase (auth + PostgreSQL), Notion API, Twelve Data API (forex), CoinGecko API (crypto), Recharts, SWR, Resend (email), Vercel.

## Proxy / Middleware

Auth routing is handled by `proxy.ts` at the repo root (Next.js 16.2.4 renamed `middleware.ts` → `proxy.ts`; exported function must be named `proxy`). It:

- Redirects unauthenticated users away from `/dashboard/*` and `/admin/*` to `/login`
- Redirects authenticated non-admins away from `/admin/*` to `/dashboard`
- Redirects admins away from `/dashboard/*` to `/admin`
- Redirects logged-in users away from `/login` to their home route

**All protected API routes also perform their own server-side auth check** using `getSupabaseServerClient()` + `user.app_metadata?.role !== "admin"`.

## Full Site Function Map

### Public Pages

| Route | Component(s) | Function |
|---|---|---|
| `/` | `Hero`, `Ticker`, `StatsRow`, `ProcessSteps`, `ProofSection`, `ProofFeed`, `PricingSection`, `LeadMagnet`, `FaqSection`, `ApplyForm` | Marketing homepage — pass rate shown as **87%** |
| `/articles` | `app/articles/page.tsx` | Blog list — Supabase `articles`, fallback to 3 hardcoded |
| `/articles/[slug]` | `app/articles/[slug]/page.tsx` | Article detail — DB first, hardcoded fallback if DB content < 500 chars. `force-dynamic` |
| `/compare` | `app/compare/page.tsx` | Static prop firm comparison table |
| `/resources` | `app/resources/page.tsx` | Resource links — Supabase `resources`, fallback to hardcoded |
| `/resources/position-size-calculator` | Interactive calculator | Lot size from balance, risk %, stop loss, pip value |
| `/resources/risk-reward-calculator` | Interactive calculator | R:R ratio calculator |
| `/resources/drawdown-tracker` | Interactive calculator | Drawdown vs FTMO limits |
| `/calendar` | `EconomicCalendarWidget` | TradingView economic calendar embed (dark theme) |
| `/links` | Static | Link-in-bio page |
| `/login` | Supabase auth | Login entry point |

Nav is auth-aware: logged-in users see "← Dashboard" instead of Login/Apply Now buttons.

### Client Dashboard (protected — any authenticated user)

Collapsible sidebar shell: `components/dashboard/DashboardShell.tsx`

| Route | Function |
|---|---|
| `/dashboard` | Trading metrics, equity curve chart (Recharts), drawdown stats — reads `client_metrics` + `equity_history` (RLS). Falls back to `past_clients` by email if no `client_metrics` row exists (archived clients) |
| `/dashboard/markets` | Live market data |
| `/dashboard/calendar` | TradingView economic calendar |
| `/dashboard/profile` | Client profile form — name, phone, address, avatar. Saves to `client_profiles` via `PATCH /api/dashboard/profile` |
| `/dashboard/support` | Support ticket submission form → `POST /api/dashboard/support` → `support_tickets` |
| `/dashboard/documents` | Documents available to the client — reads `client_documents` (RLS: own + global) |
| `/dashboard/notifications` | Internal notifications from admin — reads `client_notifications` (RLS). Mark read via `PATCH /api/dashboard/notifications/[id]` |

### Admin Portal (protected — `app_metadata.role === "admin"`)

Collapsible sidebar shell: `components/admin/AdminShell.tsx`

| Route | Function |
|---|---|
| `/admin` | Overview: combined stats (pass rate, active/historical clients), red alert for new applications, blue alert for unread inbox emails, tiles to all sections |
| `/admin/inbox` | Emails received at admin@eleusisfx.uk — split-pane list + detail view, mark-as-read, mailto reply button. Reads `received_emails` table |
| `/admin/clients` | Applications list (status, notes, Send Welcome, Open in Editor, Send PDF, archive) + email leads list. "New Client" button |
| `/admin/clients/new` | Create client auth account (stores first/last name in `user_metadata.full_name`) + seed `client_metrics` + add to `applications` |
| `/admin/articles` | List articles, toggle publish/unpublish. View links open in same tab |
| `/admin/articles/new` | Create new article → `POST /api/articles` → Supabase |
| `/admin/resources` | Full CRUD for resources shown on `/resources` |
| `/admin/past-clients` | View + edit historical client records. "Open in Email Editor →" button pre-fills editor with first name + email |
| `/admin/metrics` | Aggregate performance summary + per-client metrics editor (active + historical, year toggle) |
| `/admin/metrics/[userId]` | Per-client detail: equity curve, stat cards, progress bars, add equity entry, full metrics edit form |
| `/admin/support` | Support ticket inbox — expand tickets, inline reply (fires send-email API + auto-closes ticket), open/closed filter |
| `/admin/documents` | Document management for client downloads |
| `/admin/notifications` | Send internal notifications to specific clients. Dropdown of all client accounts, title + body fields. Shows sent history with read/unread status |
| `/admin/tools/email` | Email editor: 8 templates with dropdown, [First Name] auto-substituted from selected recipient, PDF asset insertion, batch send via Resend. Pre-fillable via `?template=&to=&name=` URL params |
| `/admin/tools/instagram` | Live Instagram Graph API metrics — account stats, post insights, audience demographics, snapshot history |
| `/admin/tools/chart` | TradingView chart tool |

### Admin API Endpoints

| Endpoint | Method(s) | Function |
|---|---|---|
| `/api/admin/metrics` | PATCH | Update `client_metrics` for a given `user_id` |
| `/api/admin/create-client` | POST | Create auth user (with `user_metadata.full_name`) + seed `client_metrics` + insert `applications` row |
| `/api/admin/reset-password` | POST | Generate Supabase recovery link |
| `/api/admin/equity` | POST | Upsert row in `equity_history` |
| `/api/admin/send-email` | POST | Batch send via `resend.batch.send()` — up to 100/call, auto-chunks larger lists |
| `/api/admin/send-welcome` | POST | Create/reset client account + send welcome email with credentials |
| `/api/admin/send-pdf` | POST | Send branded PDF download email to a client |
| `/api/admin/inbox` | GET | List received emails (admin only) |
| `/api/admin/inbox/[id]` | PATCH | Mark received email as read |
| `/api/admin/notifications` | POST, DELETE | Create or delete a client notification |
| `/api/admin/archive-client` | POST | Move application to `past_clients`, remove from `client_metrics` |
| `/api/applications` | PATCH, DELETE | Update status/notes or delete an application |
| `/api/leads` | DELETE | Delete a lead |
| `/api/past-clients` | PATCH | Update editable fields on a past client record |
| `/api/articles` | POST | Create article |
| `/api/resources` | POST, PATCH | Create or toggle active on a resource |
| `/api/dashboard/profile` | PATCH | Upsert `client_profiles` row for authenticated user |
| `/api/dashboard/support` | POST | Create `support_tickets` row |
| `/api/dashboard/notifications/[id]` | PATCH | Mark client notification as read |
| `/api/webhooks/inbound-email` | POST | Receives inbound email from Resend/ForwardEmail webhook, stores in `received_emails`. Secured with `?secret=RESEND_INBOUND_SECRET` |

## Email System

- **Outbound:** Resend SDK v6. `resend.batch.send()` — up to 100 emails per API call, auto-chunks for larger lists.
- **From address:** `admin@eleusisfx.uk` (set via `RESEND_FROM` env var)
- **Welcome email:** `lib/email/sendWelcomeEmail.ts` — includes temp password + dashboard link + free PDF guides
- **PDF email:** `lib/email/sendPdfEmail.ts`
- **Inbound (receiving):** ForwardEmail.net free plan — MX records on Vercel DNS forward `admin@eleusisfx.uk` to personal Gmail. Tested working.
- **Admin inbox panel** (`/admin/inbox`): Built and awaiting `received-emails-migration.sql` to be run in Supabase. Webhook at `/api/webhooks/inbound-email` ready — needs ForwardEmail Pro ($3/mo) to activate webhook support.
- **Email editor templates (8):**
  1. Welcome — New Client
  2. Progress Check-In
  3. Evaluation Passed
  4. Evaluation Ended
  5. Past Client — Loyalty Offer (£1,150 → £550, 87% stats)
  6. Newsletter — The Funded Trader #1
  7. Newsletter — The Funded Trader #2
  8. Re-engagement
- **[First Name] substitution:** Auto-replaced when template is loaded with exactly 1 recipient selected. Name comes from `user_metadata.full_name` (set on account creation) — falls back to email address if not set.

## New Client Creation Flow

1. Admin fills `/admin/clients/new` — **first name, last name**, email, password, prop firm, metrics
2. API creates Supabase auth user with `user_metadata: { full_name: "First Last" }`
3. Seeds `client_metrics` row
4. Inserts `applications` row with `status: "active"` so client appears in clients list
5. Admin can then click **Send Welcome** to fire credentials email, or **Open in Editor →** for a custom email

## Data Flows

- **Lead capture** → `POST /api/leads` → Supabase `leads`
- **Application form** → `POST /api/applications` → Notion (primary) + Supabase `applications` (dual-write) + auto confirmation email via Resend
- **New client (admin)** → `POST /api/admin/create-client` → Supabase auth + `client_metrics` + `applications`
- **Send welcome** → `POST /api/admin/send-welcome` → creates/resets account + sends email with temp password
- **Bulk email** → `POST /api/admin/send-email` → `resend.batch.send()` (100/batch)
- **Inbound email** → ForwardEmail.net MX → personal Gmail (+ future webhook → `received_emails`)
- **Market data** → `/api/market/forex` (Twelve Data) + `/api/market/crypto` (CoinGecko), 60s server cache

## Key Database Tables

| Table | Purpose | Migration |
|---|---|---|
| `leads` | Email captures from homepage | `applications-leads-migration.sql` |
| `applications` | Form submissions + admin-created clients | `applications-leads-migration.sql` |
| `articles` | Blog articles | `supabase-migration.sql` |
| `resources` | Resource links | `supabase-migration.sql` |
| `client_metrics` | Per-user trading stats (RLS) | `supabase-migration.sql` |
| `equity_history` | Time-series equity for chart (RLS) | `supabase-migration.sql` |
| `past_clients` | Historical records + ProofFeed ticker + metric columns | `past-clients-full-migration.sql` + `past-clients-metrics-migration.sql` |
| `instagram_metrics` | Instagram snapshot history | `instagram-metrics-migration.sql` |
| `client_profiles` | Client self-service profile (RLS) | `client-dashboard-migration.sql` |
| `support_tickets` | Client support requests (RLS) | `client-dashboard-migration.sql` |
| `client_documents` | Admin docs visible to clients (RLS) | `client-dashboard-migration.sql` |
| `client_notifications` | Admin → client internal messages (RLS) | `client-dashboard-migration.sql` |
| `received_emails` | Inbound emails at admin@eleusisfx.uk | `received-emails-migration.sql` ⚠️ **not yet run** |

## Pending Migrations (run in Supabase SQL Editor)

- `received-emails-migration.sql` — required for `/admin/inbox` to store emails
- `client-dashboard-migration.sql` — required for profile/support/documents/notifications pages

## Styling

- **Tailwind CSS 4** with custom theme vars in `globals.css`
- **Inline styles** throughout — muted text `rgba(210,220,240,0.88)`, faint `rgba(210,220,240,0.58)`
- **No global text-shadow** — removed for scroll performance (was causing site-wide jank)
- **Grid background** on `body` via `background-image` (not `::after` pseudo-element — that caused GPU repaint on scroll)
- **Scroll animation** — `@keyframes scroll` in `globals.css`, used by Ticker, PublicMarketTicker, ProofFeedTicker
- **Admin UI** — dark `#08090f` panels, `#4f8ef7` blue accent, `#22c55e` green, `#ef4444` red

## Public PDFs (in `public/`)

- `/eleusis-fx-5-fatal-mistakes.pdf`
- `/eleusis-fx-30-day-blueprint.pdf`
- `/eleusis-fx-funded-trader-mindset.pdf`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NOTION_API_KEY
NOTION_LEADS_DATABASE_ID
TWELVE_DATA_API_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_WA_NUMBER          # WhatsApp number (international format, no +)
RESEND_API_KEY
RESEND_FROM                    # admin@eleusisfx.uk
RESEND_INBOUND_SECRET          # Webhook secret for inbound email endpoint (set when activating webhook)
INSTAGRAM_BUSINESS_ACCOUNT_ID
INSTAGRAM_ACCESS_TOKEN         # Expires every 60 days — extend at developers.facebook.com/tools/explorer
```
