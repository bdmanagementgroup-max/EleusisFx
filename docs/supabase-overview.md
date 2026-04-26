# Supabase Overview — Eleusis FX

Supabase is a hosted Postgres database with a built-in auth system and a JavaScript client that lets you query it like an ORM.

## The Three Clients

Three ways to talk to Supabase, each used in different situations:

**1. Browser client** (`lib/supabase/client.ts`) — used in client components (`"use client"`). Respects the logged-in user's session automatically.

**2. Server client** (`lib/supabase/server.ts` → `getSupabaseServerClient()`) — used in server components and API routes for regular users. Also respects the user's session but runs on the server.

**3. Admin client** (`lib/supabase/server.ts` → `getSupabaseAdminClient()`) — uses the `SUPABASE_SERVICE_ROLE_KEY` secret. Bypasses all security rules. Used in admin pages and API routes that need to see all rows regardless of who's logged in.

## Row-Level Security (RLS)

Every table has security rules baked into the database itself. For example, `client_metrics` has a rule: "you can only SELECT rows where `user_id` = your own user ID." So even if a bug in your code forgot to filter by user, the database refuses to return other people's data.

The admin client bypasses RLS — that's why `SUPABASE_SERVICE_ROLE_KEY` must stay secret and never be exposed to the browser.

## Auth

Supabase handles login sessions. After a user logs in via `/login`, Supabase stores a session cookie. On every protected page:

```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");
```

Admin vs. client routing is determined by `user.app_metadata.role === "admin"` — that field is set manually in the Supabase dashboard per user.

## Querying

```ts
// Read
const { data, error } = await supabase
  .from("articles")
  .select("id, title, slug")
  .eq("published", true)
  .order("published_at", { ascending: false });

// Insert
await supabase.from("leads").insert({ email, source });

// Update
await supabase.from("resources").update({ active: false }).eq("id", id);
```

`data` is the result array (or null on error), `error` is the error object (or null on success).

## Where Each Table Is Used

| Table | Written by | Read by |
|---|---|---|
| `leads` | `/api/leads` (public form) | `/admin/clients` |
| `applications` | `/api/applications` (public form) | `/admin/clients` |
| `articles` | `/admin/articles` + `/api/articles` | `/articles`, `/articles/[slug]` |
| `resources` | `/admin/resources` + `/api/resources` | `/resources` |
| `client_metrics` | Set manually / admin tooling | `/dashboard` |
| `equity_history` | Set manually / admin tooling | `/dashboard` (equity chart) |
| `past_clients` | `/admin/past-clients` | `/admin/past-clients` |

## The Supabase Dashboard

Everything above can be managed visually at supabase.com — browse table rows, run SQL, manage users, set `app_metadata.role`, and see auth logs. This is where you manually set a user as admin or seed initial data.
