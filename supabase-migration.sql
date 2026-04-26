-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

-- Client evaluation metrics (one row per client)
create table if not exists client_metrics (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade unique,
  prop_firm      text,
  phase          int default 1,
  phase_status   text default 'in_progress', -- in_progress | passed | failed
  balance        numeric default 100000,
  equity         numeric default 100000,
  daily_drawdown numeric default 0,  -- percentage
  max_drawdown   numeric default 0,  -- percentage
  profit_target  numeric default 0,  -- percentage achieved
  profit_goal    numeric default 10, -- percentage target
  days_used      int default 0,
  days_allowed   int default 30,
  updated_at     timestamptz default now()
);

-- Equity curve history (one row per day per client)
create table if not exists equity_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  recorded_at date default current_date,
  equity      numeric not null,
  created_at  timestamptz default now(),
  unique (user_id, recorded_at)
);

-- Only the client themselves (or service role) can read their own data
alter table client_metrics enable row level security;
alter table equity_history  enable row level security;

create policy "Client reads own metrics"
  on client_metrics for select
  using (auth.uid() = user_id);

create policy "Client reads own equity history"
  on equity_history for select
  using (auth.uid() = user_id);

-- Service role (admin) can do everything — no policy needed for service_role bypass

-- Resources (admin-managed links, guides, tools shown on /resources)
create table if not exists resources (
  id          uuid primary key default gen_random_uuid(),
  category    text not null default 'General',
  title       text not null,
  url         text not null,
  description text default '',
  active      boolean default true,
  created_at  timestamptz default now()
);
