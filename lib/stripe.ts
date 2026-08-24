import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Lazily constructs the Stripe client on first use. Deferring construction
 * (rather than instantiating at module scope) keeps `next build` from
 * failing when STRIPE_SECRET_KEY isn't set yet in the build environment.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-07-29.dahlia",
    });
  }
  return _stripe;
}

export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_ID_PRO ?? "",
  portfolio: process.env.STRIPE_PRICE_ID_PORTFOLIO ?? "",
} as const;
