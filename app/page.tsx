import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import type { Jurisdiction } from "@/types/database";
import { COVERAGE_CITIES } from "@/lib/coverage-cities";

const FEATURES = [
  {
    title: "One compliance calendar per property",
    body: "Permit renewals, occupancy tax filings, and insurance check-ins — computed automatically from your city's rules and your property's dates.",
  },
  {
    title: "City-by-city regulation reference",
    body: "Curated, linked-to-source requirements for the markets hosts actually operate in, kept current and re-verified on a schedule.",
  },
  {
    title: "Email reminders before you're at risk",
    body: "A three-stage nudge ladder — 45, 14, and 3 days out — so a deadline never arrives as a surprise.",
  },
  {
    title: "A document vault for every permit",
    body: "Store your permit PDF, insurance cert, and inspection reports next to the deadline they belong to.",
  },
];

export default async function LandingPage() {
  let jurisdictions: Pick<Jurisdiction, "slug" | "city" | "state">[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("jurisdictions").select("slug,city,state").order("city");
    jurisdictions = data ?? [];
  } catch {
    // Falls back to the static coverage list below if Supabase isn't configured yet.
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center sm:pt-28">
          <p className="mx-auto mb-5 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium tracking-wide text-amber-400">
            BUILT FOR SHORT-TERM RENTAL HOSTS
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Your city changed the rules again. <span className="text-amber-500">Did you notice?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Permitly tracks the permit renewals, occupancy tax filings, and regulation changes for every short-term
            rental you host — so a missed deadline never turns into a fine, a suspended listing, or a shutdown
            notice.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Track your first property free
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              See pricing
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">Free for 1 property. No credit card required to start.</p>
        </section>

        <section className="border-y border-slate-800/80 bg-slate-900/40 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                  <h3 className="text-sm font-semibold text-slate-100">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="coverage" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-slate-100">Coverage across 18 of the strictest STR markets</h2>
            <p className="mt-3 text-slate-400">
              We start with the cities where compliance actually bites — capped-permit lotteries, primary-residence
              rules, and quarterly filings — and expand from host requests.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-300 sm:grid-cols-3">
            {jurisdictions.length > 0
              ? jurisdictions.map((j) => (
                  <Link key={j.slug} href={`/cities/${j.slug}`} className="flex items-center gap-2 hover:text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {j.city}, {j.state}
                  </Link>
                ))
              : COVERAGE_CITIES.map((city) => (
                  <div key={city} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {city}
                  </div>
                ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-slate-500">
            Don&apos;t see your city?{" "}
            <Link href="/signup" className="text-amber-500 hover:underline">
              Sign up
            </Link>{" "}
            and request it — new markets are prioritized by host demand.
          </p>
        </section>

        <section className="border-t border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950 py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-2xl font-semibold text-slate-100">Stop tracking deadlines in a spreadsheet</h2>
            <p className="mt-3 text-slate-400">
              One missed occupancy tax filing costs more than a year of Permitly. Set it up once, get reminded
              automatically.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
