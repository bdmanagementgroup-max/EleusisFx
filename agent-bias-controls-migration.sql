-- Adds the agent_bias_cron_enabled feature flag to the existing app_settings table.
-- Vercel Cron's schedule itself can't be toggled at runtime (only via redeploy),
-- so the nightly dispatcher route checks this flag and no-ops when disabled.

insert into app_settings (setting_key, setting_value)
values ('agent_bias_cron_enabled', 'true'::jsonb)
on conflict (setting_key) do nothing;

-- Best-effort lock so an admin's manual "fire now" can't overlap another
-- run already in progress (nightly cron or a second manual trigger).
insert into app_settings (setting_key, setting_value)
values ('agent_bias_dispatch_lock', 'null'::jsonb)
on conflict (setting_key) do nothing;
