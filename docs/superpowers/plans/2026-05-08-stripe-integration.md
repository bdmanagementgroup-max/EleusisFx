# Stripe Checkout + Webhook Integration Plan (ELE-48)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable subscription payments via Stripe Checkout and automatically manage subscriber roles in Supabase when checkouts complete or subscriptions are deleted.

**Architecture:** 
- Stripe SDK handles payment processing and webhook signing verification
- `/api/stripe/checkout` creates Stripe Checkout sessions, returning a redirect URL
- `/api/stripe/webhook` verifies webhook signatures and updates user roles in Supabase
- Webhook events trigger Supabase role updates: `checkout.session.completed` → add "subscriber" role; `customer.subscription.deleted` → remove role

**Tech Stack:** Stripe SDK, Next.js App Router, Supabase Auth + RLS, TypeScript

---

## File Structure

**New files to create:**
- `app/api/stripe/checkout/route.ts` — POST handler for creating checkout sessions
- `app/api/stripe/webhook/route.ts` — POST handler for Stripe webhook events
- `lib/stripe/index.ts` — Stripe client initialization
- `lib/supabase/roles.ts` — Helper functions to update user role metadata

**Files to modify:**
- `.env.local.example` — Add Stripe environment variables

**Environment setup:**
- `.env.local` — Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID (developer must fill in)

---

## Tasks

### Task 1: Install Stripe and TypeScript Types

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install stripe package**

Run: `npm install stripe` (or `pnpm add stripe`)

Expected: Stripe SDK and types installed

- [ ] **Step 2: Verify installation**

Run: `npm ls stripe`

Expected: stripe@latest (or current version) listed

---

### Task 2: Create Stripe Client Module

**Files:**
- Create: `lib/stripe/index.ts`

- [ ] **Step 1: Create Stripe client**

```typescript
// lib/stripe/index.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-15", // Use latest stable API version
});
```

- [ ] **Step 2: Verify file is syntactically correct**

Check: File has no TypeScript errors in your IDE

---

### Task 3: Create Supabase Role Update Helpers

**Files:**
- Create: `lib/supabase/roles.ts`

- [ ] **Step 1: Write role update helper**

```typescript
// lib/supabase/roles.ts
import { getSupabaseAdminClient } from "./server";

export async function addSubscriberRole(userId: string): Promise<void> {
  const supabase = await getSupabaseAdminClient();

  const { data: user, error: fetchError } = await supabase.auth.admin.getUserById(userId);
  if (fetchError || !user) throw new Error(`User not found: ${userId}`);

  const currentRoles = (user.app_metadata?.roles as string[]) || [];
  const updatedRoles = [...new Set([...currentRoles, "subscriber"])]; // Avoid duplicates

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { ...user.app_metadata, roles: updatedRoles, role: "subscriber" },
  });

  if (updateError) throw new Error(`Failed to update user: ${updateError.message}`);
}

export async function removeSubscriberRole(userId: string): Promise<void> {
  const supabase = await getSupabaseAdminClient();

  const { data: user, error: fetchError } = await supabase.auth.admin.getUserById(userId);
  if (fetchError || !user) throw new Error(`User not found: ${userId}`);

  const currentRoles = (user.app_metadata?.roles as string[]) || [];
  const updatedRoles = currentRoles.filter((r) => r !== "subscriber");

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { ...user.app_metadata, roles: updatedRoles, role: updatedRoles[0] || null },
  });

  if (updateError) throw new Error(`Failed to update user: ${updateError.message}`);
}
```

- [ ] **Step 2: Verify file is syntactically correct**

Check: File has no TypeScript errors in your IDE

---

### Task 4: Create Stripe Checkout Endpoint

**Files:**
- Create: `app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Write checkout POST handler**

```typescript
// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const authClient = await getSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "STRIPE_PRICE_ID not configured" }, { status: 500 });
    }

    const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify file is syntactically correct**

Check: File has no TypeScript errors in your IDE

---

### Task 5: Create Stripe Webhook Endpoint

**Files:**
- Create: `app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Write webhook POST handler**

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { addSubscriberRole, removeSubscriberRole } from "@/lib/supabase/roles";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn("STRIPE_WEBHOOK_SECRET is not set — webhook verification will be skipped");
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.client_reference_id || session.metadata?.userId;
  if (!userId) {
    console.warn("Checkout session missing userId:", session.id);
    return;
  }

  await addSubscriberRole(userId);
  console.log(`Added subscriber role to user ${userId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string;
  if (!customerId) {
    console.warn("Subscription missing customer:", subscription.id);
    return;
  }

  // Retrieve customer from Stripe to find the userId
  const customer = await stripe.customers.retrieve(customerId);
  const userId = (customer as Stripe.Customer).metadata?.userId;

  if (!userId) {
    console.warn("Customer missing userId metadata:", customerId);
    return;
  }

  await removeSubscriberRole(userId);
  console.log(`Removed subscriber role from user ${userId}`);
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle specific events
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify file is syntactically correct**

Check: File has no TypeScript errors in your IDE

---

### Task 6: Update Environment Variables Example

**Files:**
- Modify: `.env.local.example`

- [ ] **Step 1: Add Stripe variables to .env.local.example**

Append to `.env.local.example`:

```
# Stripe (add your actual keys from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

- [ ] **Step 2: Verify file is readable**

Check: `.env.local.example` ends with the Stripe section

---

### Task 7: Run Type Check and Verify No Errors

**Files:**
- All TypeScript files created above

- [ ] **Step 1: Run TypeScript type check**

Run: `npm run typecheck` or `npx tsc --noEmit`

Expected: No errors

- [ ] **Step 2: Verify all imports resolve**

Check:
- `lib/stripe/index.ts` imports `stripe` module ✓
- `lib/supabase/roles.ts` imports from `lib/supabase/server` ✓
- `app/api/stripe/checkout/route.ts` imports from `@/lib/stripe` and `@/lib/supabase/server` ✓
- `app/api/stripe/webhook/route.ts` imports all dependencies ✓

---

### Task 8: Commit Implementation

**Files:**
- All new and modified files from Tasks 1–6

- [ ] **Step 1: Stage all changes**

Run:
```bash
git add package.json package-lock.json app/api/stripe lib/stripe lib/supabase/roles.ts .env.local.example
```

- [ ] **Step 2: Commit with clear message**

Run:
```bash
git commit -m "feat(stripe): add checkout and webhook endpoints for subscription management

- Create /api/stripe/checkout POST endpoint to create Stripe Checkout sessions
- Create /api/stripe/webhook POST endpoint to handle checkout.session.completed and customer.subscription.deleted events
- Add helper functions to update Supabase user role metadata (add/remove subscriber role)
- Install stripe package
- Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID to .env.local.example"
```

- [ ] **Step 3: Verify commit**

Run: `git log -1 --oneline`

Expected: Latest commit shows stripe integration message

---

## Self-Review Checklist

✅ **Spec coverage:**
- "Create app/api/stripe/checkout/route.ts (POST → Stripe Checkout session)" → Task 4
- "Create app/api/stripe/webhook/route.ts (handle checkout.session.completed and customer.subscription.deleted)" → Task 5
- "On checkout complete: set role = subscriber in Supabase app_metadata" → Task 3 helpers + Task 5 handler
- "On subscription delete: remove subscriber role" → Task 3 helpers + Task 5 handler
- "Requires: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID" → Task 6

✅ **No placeholders:** All code is complete with no TBD, implement-later, or generic "add validation" steps.

✅ **Type consistency:** 
- `userId` is string throughout
- `addSubscriberRole(userId: string)` and `removeSubscriberRole(userId: string)` have matching signatures
- Stripe types are explicit (Stripe.Checkout.Session, Stripe.Subscription, Stripe.Customer)

✅ **Environment setup:** Developer must manually add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID to `.env.local` before testing (they won't have test keys committed to repo).

---

## Testing Checklist (Post-Implementation)

After implementing all tasks, verify:

1. **Type checking passes:** `npm run typecheck` returns no errors
2. **Stripe client initializes:** Log into the project and confirm no "STRIPE_SECRET_KEY is not set" error on startup
3. **Webhook signature verification:** Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. **Checkout flow:**
   - POST to `/api/stripe/checkout` with authenticated user
   - Verify returned `url` is a valid Stripe Checkout URL
   - Verify `client_reference_id` matches user ID in Stripe dashboard
5. **Webhook handling:**
   - Simulate `checkout.session.completed` event with Stripe CLI
   - Verify user role is updated to "subscriber" in Supabase
   - Simulate `customer.subscription.deleted` event
   - Verify "subscriber" role is removed

---

## Next Steps After Implementation

1. Add checkout button to `/dashboard` that calls `POST /api/stripe/checkout`
2. Create success page redirect handling after checkout
3. Add environment variable validation in CI/CD pipeline
4. Monitor webhook errors in production logs
