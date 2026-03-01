import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe/client";
import { getPortalReturnUrl } from "@/lib/stripe/config";
import { getStripeCustomerId } from "@/lib/stripe/subscription";

/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session so users can manage their subscription.
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

    // Find the user's Stripe customer ID
    const customerId = await getStripeCustomerId(userId);

    if (!customerId) {
      return NextResponse.json(
        { error: "No subscription found. Please subscribe first." },
        { status: 404 }
      );
    }

    // Determine return URL from request headers
    const origin =
      req.headers.get("origin") ?? "http://localhost:3000";

    const portalSession =
      await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: getPortalReturnUrl(origin),
      });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[portal] Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
