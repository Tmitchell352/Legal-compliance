import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { TIER_LIMITS } from "@/types/database";
import type { ComplianceDeadline, Profile, Property } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<Property[]>();

  const propertyIds = (properties ?? []).map((p) => p.id);

  const { data: deadlines } = propertyIds.length
    ? await supabase
        .from("compliance_deadlines")
        .select("*")
        .in("property_id", propertyIds)
        .eq("status", "upcoming")
        .order("due_date", { ascending: true })
        .returns<ComplianceDeadline[]>()
    : { data: [] as ComplianceDeadline[] };

  const nextDeadlineByProperty = new Map<string, ComplianceDeadline>();
  for (const d of deadlines ?? []) {
    if (!nextDeadlineByProperty.has(d.property_id)) {
      nextDeadlineByProperty.set(d.property_id, d);
    }
  }

  const tier = profile?.subscription_tier ?? "free";
  const limit = TIER_LIMITS[tier].properties;
  const atLimit = (properties?.length ?? 0) >= limit;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Your properties</h1>
          <p className="mt-1 text-sm text-slate-400">
            {properties?.length ?? 0} of {limit} properties used on the {TIER_LIMITS[tier].label} plan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tier !== "free" && (
            <a
              href="/api/export/properties"
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
            >
              Export CSV
            </a>
          )}
          {atLimit ? (
            <Link
              href="/pricing"
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
            >
              Upgrade to add more
            </Link>
          ) : (
            <Link
              href="/dashboard/properties/new"
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
            >
              + Add property
            </Link>
          )}
        </div>
      </div>

      {!properties || properties.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-800 p-12 text-center">
          <p className="text-slate-300">No properties yet.</p>
          <p className="mt-1 text-sm text-slate-500">Add your first listing to start tracking its compliance calendar.</p>
          <Link
            href="/dashboard/properties/new"
            className="mt-5 inline-block rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
          >
            + Add property
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const next = nextDeadlineByProperty.get(property.id);
            return (
              <Link
                key={property.id}
                href={`/dashboard/properties/${property.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-600"
              >
                <h2 className="font-semibold text-slate-100">{property.nickname}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {property.city}, {property.state}
                </p>
                <div className="mt-4 border-t border-slate-800 pt-4">
                  {next ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-200">{next.title}</p>
                        <p className="text-xs text-slate-500">
                          Due {new Date(next.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <DeadlineBadge dueDate={next.due_date} />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No deadlines tracked yet — open the property to generate its calendar.</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
