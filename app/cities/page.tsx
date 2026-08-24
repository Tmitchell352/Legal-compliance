import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import type { Jurisdiction } from "@/types/database";

export const metadata: Metadata = {
  title: "Short-term rental permit & tax rules by city | Permitly",
  description:
    "Permit renewal cadence, occupancy tax filing frequency, and host requirements for short-term rentals across major U.S. markets.",
};

export default async function CitiesIndexPage() {
  const supabase = await createClient();
  const { data: jurisdictions } = await supabase
    .from("jurisdictions")
    .select("*")
    .order("state", { ascending: true })
    .returns<Jurisdiction[]>();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
            Short-term rental rules, city by city
          </h1>
          <p className="mt-3 text-slate-400">
            Permit requirements, renewal cadence, and occupancy tax filing frequency — kept current and linked to the
            official source.
          </p>
        </section>
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800">
            {(jurisdictions ?? []).map((j) => (
              <li key={j.id}>
                <Link
                  href={`/cities/${j.slug}`}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-900/60"
                >
                  <span className="text-slate-100">
                    {j.city}, {j.state}
                  </span>
                  <span className="text-sm text-slate-500">
                    {j.permit_required ? "Permit required" : "No permit"} ·{" "}
                    {j.tax_filing_frequency?.replace("_", "-") ?? "—"} filing
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
