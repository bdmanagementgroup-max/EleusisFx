create table if not exists instagram_metrics (
  id            uuid primary key default gen_random_uuid(),
  recorded_at   date not null default current_date,
  followers     integer not null,
  following     integer not null,
  posts         integer not null,
  reach         integer,
  impressions   integer,
  profile_visits integer,
  website_clicks integer,
  likes         integer,
  comments      integer,
  saves         integer,
  shares        integer,
  notes         text,
  created_at    timestamptz default now()
);

alter table instagram_metrics enable row level security;

-- Admin full access (service role bypasses RLS, but explicit policy for safety)
create policy "Admin full access" on instagram_metrics
  for all using (true) with check (true);
