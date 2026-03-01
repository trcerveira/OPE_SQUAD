import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe/client";
import {
  STRIPE_PRICE_ID,
  TRIAL_DAYS,
  getCheckoutUrls,
} from "@/lib/stripe/config";
import { getStripeCustomerId } from "@/lib/stripe/subscription";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session with a 7-day free trial.
 * Requires Clerk authentication.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!STRIPE_PRICE_ID) {
      console.error("[checkout] STRIPE_PRICE_ID is not set");
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Determine base URL from request headers
    const origin =
      req.headers.get("origin") ?? "http://localhost:3000";
    const { success, cancel } = getCheckoutUrls(origin);

    // Check if the user already has a Stripe customer ID
    const existingCustomerId = await getStripeCustomerId(userId);

    // Build checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          user_id: userId,
        },
      },
      success_url: success,
      cancel_url: cancel,
      metadata: {
        user_id: userId,
      },
    };

    // Reuse existing Stripe customer if available
    // In subscription mode, Stripe creates a customer automatically if none is provided
    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
