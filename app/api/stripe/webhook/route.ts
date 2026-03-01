import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/stripe/webhook
 * Receives Stripe webhook events and updates the subscriptions table.
 * No auth — Stripe calls this directly. Verified via webhook signature.
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Read raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        // Unhandled event type — log for debugging
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[webhook] Error handling ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ─── Event Handlers ─────────────────────────────────────────

/**
 * checkout.session.completed
 * Fired when the user completes the Checkout flow.
 * Creates or updates the subscription row in Supabase.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId) {
    console.error("[webhook] checkout.session.completed: missing user_id in metadata");
    return;
  }

  if (!subscriptionId) {
    console.error("[webhook] checkout.session.completed: missing subscription ID");
    return;
  }

  // Fetch the full subscription from Stripe to get trial/period details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // In Stripe SDK v20+, current_period_end is on the subscription items
  const periodEnd = getItemPeriodEnd(subscription);

  const supabase = createServerClient();

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId ?? null,
      stripe_sub_id: subscriptionId,
      plan: subscription.status === "trialing" ? "trial" : "monthly",
      status: mapStripeStatus(subscription.status),
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[webhook] Error upserting subscription:", error.message);
    throw error;
  }

  console.log(
    `[webhook] Subscription created for user ${userId} (status: ${subscription.status})`
  );
}

/**
 * customer.subscription.updated
 * Fired when the subscription status changes (e.g., trial -> active, past_due).
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error("[webhook] subscription.updated: missing user_id in metadata");
    return;
  }

  // In Stripe SDK v20+, current_period_end is on the subscription items
  const periodEnd = getItemPeriodEnd(subscription);

  const supabase = createServerClient();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: mapStripeStatus(subscription.status),
      plan: subscription.status === "trialing" ? "trial" : "monthly",
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
      cancelled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_sub_id", subscription.id);

  if (error) {
    console.error("[webhook] Error updating subscription:", error.message);
    throw error;
  }

  console.log(
    `[webhook] Subscription updated for user ${userId} -> ${subscription.status}`
  );
}

/**
 * customer.subscription.deleted
 * Fired when a subscription is cancelled and the period ends.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error("[webhook] subscription.deleted: missing user_id in metadata");
    return;
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_sub_id", subscription.id);

  if (error) {
    console.error("[webhook] Error deleting subscription:", error.message);
    throw error;
  }

  console.log(`[webhook] Subscription cancelled for user ${userId}`);
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Extract current_period_end from the first subscription item.
 * In Stripe SDK v20+ (API 2026-02-25), this field moved from Subscription
 * to SubscriptionItem.
 */
function getItemPeriodEnd(
  subscription: Stripe.Subscription
): number | null {
  const firstItem = subscription.items?.data?.[0];
  return firstItem?.current_period_end ?? null;
}

/**
 * Map Stripe subscription status to our internal status.
 * Stripe statuses: incomplete, incomplete_expired, trialing, active,
 *                  past_due, canceled, unpaid, paused
 * Our statuses: trial, active, cancelled, past_due
 */
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): string {
  switch (stripeStatus) {
    case "trialing":
      return "trial";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "cancelled";
    default:
      // incomplete, paused -> treat as trial (pending first payment)
      return "trial";
  }
}
