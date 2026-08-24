import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import type { Profile } from "@/types/database";

export async function GET(request: NextRequest) {
  const plan = request.nextUrl.searchParams.get("plan");
  if (plan !== "pro" && plan !== "portfolio") {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `/api/stripe/checkout?plan=${plan}`);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();

  const stripe = getStripe();
  let customerId = profile?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_IDS[plan], quantity: 1 }],
    success_url: `${request.nextUrl.origin}/dashboard?checkout=success`,
    cancel_url: `${request.nextUrl.origin}/pricing?checkout=canceled`,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id, plan },
    subscription_data: { metadata: { supabase_user_id: user.id, plan } },
  });

  return NextResponse.redirect(session.url!);
}
