# Eleusis FX — Discord Content Pack

Ready-to-post content for the Eleusis FX Discord server.
Derived from articles on eleusisfx.uk.

## Structure

- `welcome-channel.md` — Server rules, welcome message, about us
- `announcements.md` — Launch announcements
- `articles/` — Article summaries formatted for Discord embeds
- `daily-tips.md` — Short daily trading tips (30 days worth)
- `channel-structure.md` — Recommended Discord channel/category layout
- `webhook-poster.py` — Script to post content via Discord webhook (needs DISCORD_WEBHOOK_URL)

## Usage

1. Copy-paste content manually into Discord channels, OR
2. Set `DISCORD_WEBHOOK_URL` env var and run `python3 webhook-poster.py` to auto-post
