import Stripe from "stripe";

// Server-side Stripe client
// Used ONLY in API routes — never in the browser
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "Missing STRIPE_SECRET_KEY environment variable. Add it to .env.local"
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});
