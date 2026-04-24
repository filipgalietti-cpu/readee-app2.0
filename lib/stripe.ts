import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export const PRICES = {
  // Readee+ consumer subscription
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual: process.env.STRIPE_PRICE_ANNUAL!,
  // Teacher Solo — individual-teacher SKU ($19/mo, $180/yr)
  teacherSoloMonthly: process.env.STRIPE_PRICE_TEACHER_SOLO_MONTHLY!,
  teacherSoloAnnual: process.env.STRIPE_PRICE_TEACHER_SOLO_ANNUAL!,
} as const;

/**
 * Map a Stripe price ID to the plan string stored on profiles.plan.
 * Webhook uses this to translate a subscription into the user-facing
 * plan tier.
 */
export function planFromPriceId(priceId: string | null | undefined): "premium" | "teacher_solo" | null {
  if (!priceId) return null;
  if (
    priceId === process.env.STRIPE_PRICE_TEACHER_SOLO_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_TEACHER_SOLO_ANNUAL
  ) {
    return "teacher_solo";
  }
  if (
    priceId === process.env.STRIPE_PRICE_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_ANNUAL
  ) {
    return "premium";
  }
  return null;
}
