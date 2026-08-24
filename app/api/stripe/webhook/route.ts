import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { SubscriptionStatus, SubscriptionTier } from "@/types/database";

function tierFromPriceId(priceId: string | undefined): SubscriptionTier {
  if (priceId === STRIPE_PRICE_IDS.portfolio) return "portfolio";
  if (priceId === STRIPE_PRICE_IDS.pro) return "pro";
  return "free";
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "none";
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id ?? session.client_reference_id;
      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const tier = tierFromPriceId(subscription.items.data[0]?.price.id);
        await supabase
          .from("profiles")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            subscription_status: mapStripeStatus(subscription.status),
            subscription_tier: tier,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const tier = tierFromPriceId(subscription.items.data[0]?.price.id);
      await supabase
        .from("profiles")
        .update({
          stripe_subscription_id: subscription.id,
          subscription_status: mapStripeStatus(subscription.status),
          subscription_tier: tier,
        })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("profiles")
        .update({
          subscription_status: "canceled",
          subscription_tier: "free",
        })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
