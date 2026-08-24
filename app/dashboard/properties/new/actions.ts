"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateDeadlines } from "@/lib/compliance-engine";
import { TIER_LIMITS } from "@/types/database";
import type { Jurisdiction, Profile } from "@/types/database";

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const tier = profile?.subscription_tier ?? "free";
  if ((count ?? 0) >= TIER_LIMITS[tier].properties) {
    redirect("/pricing?reason=limit");
  }

  const nickname = String(formData.get("nickname") ?? "").trim();
  const addressLine = String(formData.get("address_line") ?? "").trim();
  const jurisdictionId = String(formData.get("jurisdiction_id") ?? "");
  const permitIssuedOn = String(formData.get("permit_issued_on") ?? "") || null;
  const permitExpiresOn = String(formData.get("permit_expires_on") ?? "") || null;
  const lastTaxFiledOn = String(formData.get("last_tax_filed_on") ?? "") || null;

  if (!nickname || !jurisdictionId) {
    redirect("/dashboard/properties/new?error=Nickname+and+city+are+required");
  }

  const { data: jurisdiction } = await supabase
    .from("jurisdictions")
    .select("*")
    .eq("id", jurisdictionId)
    .single<Jurisdiction>();

  if (!jurisdiction) {
    redirect("/dashboard/properties/new?error=Select+a+valid+city");
  }

  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      user_id: user.id,
      jurisdiction_id: jurisdiction!.id,
      nickname,
      address_line: addressLine || null,
      city: jurisdiction!.city,
      state: jurisdiction!.state,
      permit_issued_on: permitIssuedOn,
      permit_expires_on: permitExpiresOn,
      last_tax_filed_on: lastTaxFiledOn,
    })
    .select()
    .single();

  if (error || !property) {
    redirect(`/dashboard/properties/new?error=${encodeURIComponent(error?.message ?? "Could not create property")}`);
  }

  const deadlines = generateDeadlines(
    {
      permitRequired: jurisdiction!.permit_required,
      permitName: jurisdiction!.permit_name,
      permitRenewalMonths: jurisdiction!.permit_renewal_months,
      taxName: jurisdiction!.tax_name,
      taxFilingFrequency: jurisdiction!.tax_filing_frequency,
    },
    {
      permitIssuedOn: permitIssuedOn ? new Date(permitIssuedOn) : null,
      permitExpiresOn: permitExpiresOn ? new Date(permitExpiresOn) : null,
      lastTaxFiledOn: lastTaxFiledOn ? new Date(lastTaxFiledOn) : null,
    }
  );

  if (deadlines.length > 0) {
    await supabase.from("compliance_deadlines").insert(
      deadlines.map((d) => ({
        property_id: property!.id,
        kind: d.kind,
        title: d.title,
        due_date: d.dueDate.toISOString().slice(0, 10),
      }))
    );
  }

  redirect(`/dashboard/properties/${property!.id}`);
}
