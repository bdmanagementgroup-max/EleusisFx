-- Run in Supabase Dashboard → SQL Editor → New query

-- Applications (website apply form submissions)
create table if not exists applications (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  whatsapp    text,
  prop_firm   text,
  notes       text,
  status      text default 'new',   -- new | reviewed | active | funded | pending
  created_at  timestamptz default now()
);

-- Email leads (lead magnet free guide signups)
create table if not exists leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text default 'free_guide',
  created_at timestamptz default now()
);

-- No RLS needed — admin portal uses service role key which bypasses RLS
