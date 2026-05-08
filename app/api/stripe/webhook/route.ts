import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { sendTelegramInviteEmail, generateTelegramInviteLink } from "@/lib/email/sendTelegramInvite";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured or signature missing" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook Signature Error]", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabase = await getSupabaseAdminClient();

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const userEmail = session.customer_email;

      if (!userId) {
        console.error("[Webhook] checkout.session.completed: no supabase_user_id in metadata");
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
      }

      // Update user role to subscriber
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        app_metadata: { role: "subscriber" },
      });

      if (error) {
        console.error("[Webhook] Failed to update user role:", error);
        return NextResponse.json({ error: "Failed to update subscriber status" }, { status: 500 });
      }

      console.log(`[Webhook] User ${userId} set to subscriber role`);

      // Generate Telegram invite and email to subscriber
      if (userEmail) {
        const inviteLink = await generateTelegramInviteLink();
        if (inviteLink) {
          await sendTelegramInviteEmail(userEmail, inviteLink);
        } else {
          console.warn(`[Webhook] Could not generate Telegram invite for ${userEmail}, skipping email`);
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`[Webhook] Subscription deleted for customer ${subscription.customer}`);

      // TODO: Link Stripe customer ID to Supabase user and remove subscriber role
      // This requires storing the Stripe customer ID with the user on first checkout
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook Processing Error]", message);
    return NextResponse.json({ error: `Processing error: ${message}` }, { status: 500 });
  }
}
