import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import type { Profile } from "@/types/database";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/dashboard/settings", request.url));
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();

  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${request.nextUrl.origin}/dashboard/settings`,
  });

  return NextResponse.redirect(session.url);
}
