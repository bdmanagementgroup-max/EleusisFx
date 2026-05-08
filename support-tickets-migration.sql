-- Run in Supabase Dashboard → SQL Editor → New query

-- Support tickets created by users via the dashboard
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table support_tickets enable row level security;

-- Users can only read/insert their own tickets
create policy "Users can read own tickets" on support_tickets
  for select using (auth.uid() = user_id);

create policy "Users can insert own tickets" on support_tickets
  for insert with check (auth.uid() = user_id);

-- Admins can read all tickets
create policy "Admins can read all tickets" on support_tickets
  for select using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and (raw_app_meta_data->>'role') = 'admin'
    )
  );

-- Create index on user_id for query performance
create index if not exists idx_support_tickets_user_id on support_tickets(user_id);
create index if not exists idx_support_tickets_created_at on support_tickets(created_at);
