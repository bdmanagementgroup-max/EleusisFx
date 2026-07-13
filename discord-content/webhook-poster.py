#!/usr/bin/env python3
"""
Discord Webhook Content Poster for Eleusis FX

Posts content from markdown files to Discord channels via webhooks.

Usage:
  export DISCORD_WEBHOOK_WELCOME="https://discord.com/api/webhooks/..."
  export DISCORD_WEBHOOK_ANNOUNCEMENTS="https://discord.com/api/webhooks/..."
  export DISCORD_WEBHOOK_ARTICLES="https://discord.com/api/webhooks/..."
  export DISCORD_WEBHOOK_TIPS="https://discord.com/api/webhooks/..."
  export DISCORD_WEBHOOK_FAQ="https://discord.com/api/webhooks/..."

  python3 webhook-poster.py welcome       # Post welcome content
  python3 webhook-poster.py announcements  # Post announcements
  python3 webhook-poster.py articles       # Post all article summaries
  python3 webhook-poster.py tip 1          # Post tip for day N
  python3 webhook-poster.py faq            # Post FAQ

Each post is split on "---" separators and sent as individual messages.
Discord's 2000-char limit is respected (messages split if needed).
"""

import os
import sys
import time
import re
import requests

WEBHOOK_MAP = {
    "welcome": "DISCORD_WEBHOOK_WELCOME",
    "announcements": "DISCORD_WEBHOOK_ANNOUNCEMENTS",
    "articles": "DISCORD_WEBHOOK_ARTICLES",
    "tip": "DISCORD_WEBHOOK_TIPS",
    "tips": "DISCORD_WEBHOOK_TIPS",
    "faq": "DISCORD_WEBHOOK_FAQ",
}

FILE_MAP = {
    "welcome": "welcome-channel.md",
    "announcements": "announcements.md",
    "articles": "articles/article-posts.md",
    "tip": "daily-tips.md",
    "tips": "daily-tips.md",
    "faq": "faq.md",
}

DISCORD_MAX_LENGTH = 2000
RATE_LIMIT_DELAY = 1.5  # seconds between messages


def load_posts(filepath: str) -> list[str]:
    """Load markdown file and split into individual posts on '---' separator."""
    with open(filepath, "r") as f:
        content = f.read()

    # Split on --- (horizontal rule) that's on its own line
    posts = re.split(r"\n---\n", content)

    # Clean up: remove leading/trailing whitespace, skip empty/comment-only blocks
    cleaned = []
    for post in posts:
        post = post.strip()
        # Skip if it's only comments (lines starting with #) or empty
        lines = [l for l in post.split("\n") if not l.startswith("# ═") and l.strip()]
        if not lines:
            continue
        # Remove markdown comment lines (starting with # but only if they look like file headers)
        filtered_lines = []
        for line in post.split("\n"):
            if line.startswith("# ═"):
                continue
            if line.startswith("# ") and any(
                kw in line.lower()
                for kw in [
                    "post one per day",
                    "#welcome",
                    "#announcements",
                    "#articles",
                    "#daily-tips",
                    "#faq",
                    "article summaries",
                ]
            ):
                continue
            filtered_lines.append(line)
        text = "\n".join(filtered_lines).strip()
        if text and len(text) > 10:
            cleaned.append(text)

    return cleaned


def split_message(text: str, max_len: int = DISCORD_MAX_LENGTH) -> list[str]:
    """Split a message into chunks that fit Discord's character limit."""
    if len(text) <= max_len:
        return [text]

    chunks = []
    while text:
        if len(text) <= max_len:
            chunks.append(text)
            break
        # Find a good split point (newline before max_len)
        split_at = text.rfind("\n", 0, max_len)
        if split_at == -1:
            split_at = max_len
        chunks.append(text[:split_at])
        text = text[split_at:].lstrip("\n")

    return chunks


def post_to_discord(webhook_url: str, content: str, username: str = "Eleusis FX"):
    """Send a message to Discord via webhook."""
    for chunk in split_message(content):
        payload = {"content": chunk, "username": username}
        resp = requests.post(webhook_url, json=payload)

        if resp.status_code == 429:
            # Rate limited — wait and retry
            retry_after = resp.json().get("retry_after", 5)
            print(f"  Rate limited, waiting {retry_after}s...")
            time.sleep(retry_after)
            resp = requests.post(webhook_url, json=payload)

        if resp.status_code not in (200, 204):
            print(f"  ⚠ Failed to post (HTTP {resp.status_code}): {resp.text[:200]}")
        else:
            print(f"  ✓ Posted ({len(chunk)} chars)")

        time.sleep(RATE_LIMIT_DELAY)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 webhook-poster.py <channel> [day_number]")
        print("Channels: welcome, announcements, articles, tip <N>, faq")
        sys.exit(1)

    channel = sys.argv[1].lower()

    if channel not in WEBHOOK_MAP:
        print(f"Unknown channel: {channel}")
        print(f"Available: {', '.join(WEBHOOK_MAP.keys())}")
        sys.exit(1)

    webhook_url = os.environ.get(WEBHOOK_MAP[channel])
    if not webhook_url:
        print(f"Error: Set {WEBHOOK_MAP[channel]} environment variable")
        print(f"Example: export {WEBHOOK_MAP[channel]}='https://discord.com/api/webhooks/...'")
        sys.exit(1)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(script_dir, FILE_MAP[channel])

    if not os.path.exists(filepath):
        print(f"Error: File not found: {filepath}")
        sys.exit(1)

    posts = load_posts(filepath)

    if channel == "tip" and len(sys.argv) >= 3:
        # Post a specific day's tip
        day = int(sys.argv[2])
        day_posts = [p for p in posts if f"**Day {day}**" in p]
        if not day_posts:
            print(f"No tip found for day {day}")
            sys.exit(1)
        posts = day_posts

    print(f"Posting {len(posts)} message(s) to #{channel}...")
    for i, post in enumerate(posts, 1):
        print(f"\nMessage {i}/{len(posts)}:")
        post_to_discord(webhook_url, post)

    print(f"\n✅ Done! Posted {len(posts)} messages.")


if __name__ == "__main__":
    main()
