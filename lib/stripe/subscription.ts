import { createServerClient } from "@/lib/supabase/server";
import { ACTIVE_STATUSES } from "./config";

// Subscription row shape from the `subscriptions` table
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_sub_id: string | null;
  plan: string;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch the active subscription for a given user.
 * Returns null if the user has no subscription or only cancelled ones.
 */
export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", [...ACTIVE_STATUSES])
    .maybeSingle();

  if (error) {
    console.error("[getSubscription] Supabase error:", error.message);
    return null;
  }

  return data as Subscription | null;
}

/**
 * Check if the user has an active subscription (trial or paid).
 */
export async function hasActiveSubscription(
  userId: string
): Promise<boolean> {
  const sub = await getSubscription(userId);
  return sub !== null;
}

/**
 * Check if the user is currently in a trial period.
 */
export async function isTrialing(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  if (!sub) return false;

  if (sub.status !== "trial") return false;

  // Double-check the trial hasn't expired server-side
  if (sub.trial_ends_at) {
    const trialEnd = new Date(sub.trial_ends_at);
    return trialEnd > new Date();
  }

  return true;
}

/**
 * Get the Stripe customer ID for a user (if they have a subscription).
 * Used to create portal sessions without creating a new customer.
 */
export async function getStripeCustomerId(
  userId: string
): Promise<string | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getStripeCustomerId] Supabase error:", error.message);
    return null;
  }

  return data?.stripe_customer_id ?? null;
}
