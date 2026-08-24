import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import type { Jurisdiction } from "@/types/database";

async function getJurisdiction(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("jurisdictions").select("*").eq("slug", slug).single<Jurisdiction>();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const j = await getJurisdiction(slug);
  if (!j) return {};

  const title = `${j.city}, ${j.state} short-term rental permit & tax rules | Permitly`;
  const description = `${j.permit_name ?? "Permit"} renewal cadence, ${j.tax_name ?? "occupancy tax"} filing frequency, and host requirements for short-term rentals in ${j.city}, ${j.state}.`;
  return { title, description };
}

export default async function CityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const jurisdiction = await getJurisdiction(slug);
  if (!jurisdiction) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <article className="mx-auto max-w-2xl px-6 py-16">
          <Link href="/cities" className="text-sm text-slate-400 hover:text-slate-200">
            ← All cities
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-50">
            {jurisdiction.city}, {jurisdiction.state} short-term rental rules
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Reference data last reviewed {new Date(jurisdiction.last_verified_on).toLocaleDateString()}
          </p>

          {jurisdiction.permit_required && (
            <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-slate-100">Permit</h2>
              <p className="mt-2 text-slate-300">{jurisdiction.permit_name}</p>
              <p className="mt-1 text-sm text-slate-400">
                Administered by {jurisdiction.permit_authority}. Renews every {jurisdiction.permit_renewal_months} months.
              </p>
              {jurisdiction.permit_url && (
                <a href={jurisdiction.permit_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-amber-500 hover:underline">
                  View official permit page ↗
                </a>
              )}
            </section>
          )}

          {jurisdiction.tax_name && (
            <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-slate-100">Occupancy tax</h2>
              <p className="mt-2 text-slate-300">{jurisdiction.tax_name}</p>
              <p className="mt-1 text-sm text-slate-400 capitalize">
                Filed {jurisdiction.tax_filing_frequency?.replace("_", "-")} with {jurisdiction.tax_authority}.
              </p>
              {jurisdiction.tax_url && (
                <a href={jurisdiction.tax_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-amber-500 hover:underline">
                  View official tax page ↗
                </a>
              )}
            </section>
          )}

          {(jurisdiction.occupancy_notes || jurisdiction.insurance_notes || jurisdiction.other_requirements) && (
            <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-slate-100">Other requirements</h2>
              <ul className="mt-2 flex flex-col gap-2 text-sm text-slate-400">
                {jurisdiction.occupancy_notes && <li>{jurisdiction.occupancy_notes}</li>}
                {jurisdiction.insurance_notes && <li>{jurisdiction.insurance_notes}</li>}
                {jurisdiction.other_requirements && <li>{jurisdiction.other_requirements}</li>}
              </ul>
            </section>
          )}

          <p className="mt-8 text-xs text-slate-600">
            This page is informational and not legal advice. Ordinances change and vary by neighborhood or zone —
            confirm current requirements with {jurisdiction.permit_authority ?? "your local authority"} before
            relying on it.
          </p>

          <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
            <p className="text-slate-200">Track this property&apos;s renewal dates automatically.</p>
            <Link
              href="/signup"
              className="mt-4 inline-block rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              Add a {jurisdiction.city} property free
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
