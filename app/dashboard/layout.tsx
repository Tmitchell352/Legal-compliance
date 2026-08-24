import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS } from "@/types/database";
import type { Profile } from "@/types/database";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  const tier = profile?.subscription_tier ?? "free";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800/80">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-100">
              Permit<span className="text-amber-500">ly</span>
            </Link>
            <div className="hidden gap-6 text-sm text-slate-300 sm:flex">
              <Link href="/dashboard" className="hover:text-slate-100">
                Properties
              </Link>
              <Link href="/dashboard/settings" className="hover:text-slate-100">
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium capitalize text-slate-300">
              {TIER_LIMITS[tier].label} plan
            </span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-slate-400 hover:text-slate-100">
                Sign out
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
