// Stripe configuration constants for OPB Crew

// Price ID from Stripe Dashboard (Products → Pricing)
// Set in environment: STRIPE_PRICE_ID
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";

// Trial period in days (7-day free trial with card required)
export const TRIAL_DAYS = 7;

// URLs for Stripe Checkout redirects
export const getCheckoutUrls = (baseUrl: string) => ({
  success: `${baseUrl}/dashboard?checkout=success`,
  cancel: `${baseUrl}/dashboard?checkout=cancel`,
});

// URLs for Stripe Customer Portal redirects
export const getPortalReturnUrl = (baseUrl: string) =>
  `${baseUrl}/dashboard`;

// Subscription statuses that grant access
export const ACTIVE_STATUSES = ["trial", "active"] as const;

// Subscription plan types
export const PLANS = {
  TRIAL: "trial",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;
