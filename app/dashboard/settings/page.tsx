import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS } from "@/types/database";
import type { Profile } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single<Profile>();
  const tier = profile?.subscription_tier ?? "free";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-100">Settings</h1>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-sm font-semibold text-slate-100">Account</h2>
        <p className="mt-2 text-sm text-slate-400">{profile?.email}</p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-sm font-semibold text-slate-100">Subscription</h2>
        <p className="mt-2 text-sm text-slate-400">
          Currently on the <span className="text-slate-200">{TIER_LIMITS[tier].label}</span> plan (
          {TIER_LIMITS[tier].properties} properties · status: {profile?.subscription_status ?? "none"}).
        </p>
        <div className="mt-4 flex gap-3">
          {tier === "free" ? (
            <Link
              href="/pricing"
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
            >
              Upgrade plan
            </Link>
          ) : (
            <a
              href="/api/stripe/portal"
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
            >
              Manage billing
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
