-- Run in Supabase Dashboard → SQL Editor → New query
-- Creates the app_settings table for feature flags and global config

create table if not exists app_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed default settings
insert into app_settings (setting_key, setting_value)
values ('ai_coach_enabled', 'false'::jsonb)
on conflict (setting_key) do nothing;

-- Enable RLS
alter table app_settings enable row level security;

-- Admins can read all settings
create policy "Admins can read settings" on app_settings
  for select using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and (raw_app_meta_data->>'role') = 'admin'
    )
  );

-- Admins can update settings
create policy "Admins can update settings" on app_settings
  for update using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and (raw_app_meta_data->>'role') = 'admin'
    )
  );
