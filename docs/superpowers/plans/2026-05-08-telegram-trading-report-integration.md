# Telegram Trading Report Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Post the full trading analysis report to the "Eleusis Fx Official" Telegram channel automatically every time a report is generated via the admin trading analysis tool.

**Architecture:** A new `lib/telegram/sendToTelegram.ts` utility wraps the Telegram Bot API. The existing streaming API route (`app/api/admin/trading-analysis/route.ts`) is modified to collect all streamed chunks server-side, and after the Claude stream closes, fire-and-forget post the full report to Telegram. The client UI shows a "Posted to Telegram" badge after analysis completes.

**Tech Stack:** Telegram Bot API (sendMessage), Next.js App Router API route, existing ReadableStream pattern, env vars `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHANNEL_ID`.

---

## Pre-Implementation: Telegram Bot Setup

Before writing any code, the Telegram bot must be created and connected to the channel:

1. Open Telegram and message **@BotFather**
2. Send `/newbot`, follow prompts, copy the **HTTP API token** (looks like `123456:ABC-DEF...`)
3. Add this bot as an **Administrator** of the "Eleusis Fx Official" channel (channel Settings → Administrators → Add Admin → search bot username)
4. Get the channel ID:
   - If the channel is public: use `@EleusisFxOfficial` (or whatever the @username is)
   - If private: forward any message from the channel to **@userinfobot** to get the numeric ID (e.g. `-1001234567890`)
5. Add these to `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHANNEL_ID=@EleusisFxOfficial
   ```
6. Add the same vars to Vercel via `vercel env add TELEGRAM_BOT_TOKEN` and `vercel env add TELEGRAM_CHANNEL_ID`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/telegram/sendToTelegram.ts` | **Create** | Telegram Bot API wrapper — splits long messages, posts to channel |
| `app/api/admin/trading-analysis/route.ts` | **Modify** | Collect all stream chunks, post to Telegram after stream closes |
| `app/admin/tools/trading-analysis/TradingAnalysisClient.tsx` | **Modify** | Show "Posted to Telegram" badge after analysis completes |
| `.env.local` | **Modify** | Add `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHANNEL_ID` |

---

## Task 1: Create Telegram Utility

**Files:**
- Create: `lib/telegram/sendToTelegram.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/telegram/sendToTelegram.ts
const MAX_MESSAGE_LENGTH = 4000; // Telegram limit is 4096; leave buffer

function splitMessage(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > MAX_MESSAGE_LENGTH) {
    const breakAt = remaining.lastIndexOf("\n", MAX_MESSAGE_LENGTH);
    const splitAt = breakAt > 100 ? breakAt : MAX_MESSAGE_LENGTH;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).replace(/^\n+/, "");
  }
  if (remaining.trim()) chunks.push(remaining);
  return chunks;
}

export async function sendToTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !channelId) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set — skipping");
    return;
  }

  const chunks = splitMessage(text);
  for (const chunk of chunks) {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: channelId, text: chunk }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[Telegram] sendMessage failed:", err);
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/telegram/sendToTelegram.ts
git commit -m "feat: add Telegram sendToTelegram utility with message splitting"
```

---

## Task 2: Integrate Telegram Post into the Analysis API Route

**Files:**
- Modify: `app/api/admin/trading-analysis/route.ts`

- [ ] **Step 1: Read the current route file**

Open `app/api/admin/trading-analysis/route.ts`. Find the `ReadableStream` construction — it will look roughly like:

```typescript
const stream = new ReadableStream({
  async start(controller) {
    const response = await anthropic.messages.stream({ ... });
    for await (const event of response) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        controller.enqueue(new TextEncoder().encode(event.delta.text));
      }
    }
    controller.close();
  },
});
return new Response(stream, { ... });
```

- [ ] **Step 2: Add import at the top of the route file**

Add this import after the existing imports:

```typescript
import { sendToTelegram } from "@/lib/telegram/sendToTelegram";
```

- [ ] **Step 3: Modify the ReadableStream to collect chunks and post to Telegram**

Replace the `ReadableStream` construction with the version below. The key change is:
1. Declare a `chunks: string[]` array before the stream
2. Push each text chunk into `chunks` as it's enqueued
3. After `controller.close()`, join all chunks and call `sendToTelegram` (fire-and-forget with `.catch`)

```typescript
const chunks: string[] = [];

const stream = new ReadableStream({
  async start(controller) {
    const response = await anthropic.messages.stream({
      // ... (keep all existing options exactly as they are)
    });

    for await (const event of response) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        const text = event.delta.text;
        chunks.push(text);
        controller.enqueue(new TextEncoder().encode(text));
      }
    }

    controller.close();

    // Post full report to Telegram after streaming completes
    const fullReport = chunks.join("");
    sendToTelegram(fullReport).catch((err) =>
      console.error("[Telegram] Failed to post report:", err)
    );
  },
});

return new Response(stream, {
  headers: { "Content-Type": "text/plain; charset=utf-8" },
});
```

Note: preserve any existing `headers` object exactly as it already exists in the file.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/trading-analysis/route.ts
git commit -m "feat: post full trading analysis report to Telegram after stream completes"
```

---

## Task 3: Add "Posted to Telegram" Badge in the UI

**Files:**
- Modify: `app/admin/tools/trading-analysis/TradingAnalysisClient.tsx`

- [ ] **Step 1: Find where the analysis completes in the client**

In `TradingAnalysisClient.tsx`, find the `fetch` + stream reading logic. It will look roughly like:

```typescript
const reader = response.body!.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  setOutput(prev => prev + decoder.decode(value));
}
setIsLoading(false);
```

The `done` branch (or after the while loop) is where analysis is complete.

- [ ] **Step 2: Add a `postedToTelegram` state**

Near the other `useState` declarations at the top of the component, add:

```typescript
const [postedToTelegram, setPostedToTelegram] = useState(false);
```

- [ ] **Step 3: Set the state when the stream finishes**

In the stream reading loop, after `setIsLoading(false)` (when done), add:

```typescript
setPostedToTelegram(true);
```

Also reset it when a new analysis starts (where `setIsLoading(true)` is called):

```typescript
setPostedToTelegram(false);
```

- [ ] **Step 4: Add the badge to the UI**

Find where the output section is rendered. Add the badge just above or below the output container, conditionally rendered:

```tsx
{postedToTelegram && (
  <div style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    borderRadius: "6px",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: 500,
    marginBottom: "8px",
  }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    Posted to Telegram
  </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/tools/trading-analysis/TradingAnalysisClient.tsx
git commit -m "feat: show Posted to Telegram badge after analysis completes"
```

---

## Task 4: Add Env Vars to .env.local

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add the two new env vars to `.env.local`**

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=@EleusisFxOfficial
```

Replace values with the actual bot token and channel ID from the pre-implementation setup.

- [ ] **Step 2: Verify `.env.local` is in `.gitignore`**

```bash
grep ".env.local" .gitignore
```

Expected output: `.env.local` (if missing, add it — never commit this file).

---

## Verification

- [ ] **1. Start dev server**
  ```bash
  npm run dev
  ```

- [ ] **2. Navigate to `/admin/tools/trading-analysis`**

- [ ] **3. Select any session (e.g. London) and click "Run Analysis"**

- [ ] **4. Watch the report stream in as normal**

- [ ] **5. After the stream completes, verify:**
  - The "Posted to Telegram" green badge appears in the UI
  - The Telegram channel "Eleusis Fx Official" has received the report (check the channel on your phone/desktop)
  - If the report is long, it should arrive as multiple sequential messages

- [ ] **6. Check server logs for any Telegram errors**
  In the terminal where `npm run dev` is running, there should be no `[Telegram]` error lines.

- [ ] **7. Test error case (optional):** Temporarily set `TELEGRAM_BOT_TOKEN=bad_token` in `.env.local`, run analysis, verify a `[Telegram] sendMessage failed:` error is logged but the analysis still streams normally (Telegram failure is non-blocking).

- [ ] **8. Deploy to Vercel**
  ```bash
  vercel env add TELEGRAM_BOT_TOKEN
  vercel env add TELEGRAM_CHANNEL_ID
  ```
  Then push to main and verify the same flow on the production URL.
