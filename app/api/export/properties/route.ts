import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ComplianceDeadline, Profile, Property } from "@/types/database";

function csvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  "Property",
  "City",
  "State",
  "Permit number",
  "Permit issued",
  "Permit expires",
  "Last tax filed",
  "Deadline",
  "Deadline type",
  "Due date",
  "Status",
];

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/api/export/properties", request.url));
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  const tier = profile?.subscription_tier ?? "free";

  if (tier === "free") {
    return NextResponse.redirect(new URL("/pricing?reason=export", request.url));
  }

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", user.id)
    .order("nickname")
    .returns<Property[]>();

  const propertyIds = (properties ?? []).map((p) => p.id);
  const { data: deadlines } = propertyIds.length
    ? await supabase
        .from("compliance_deadlines")
        .select("*")
        .in("property_id", propertyIds)
        .order("due_date")
        .returns<ComplianceDeadline[]>()
    : { data: [] as ComplianceDeadline[] };

  const deadlinesByProperty = new Map<string, ComplianceDeadline[]>();
  for (const d of deadlines ?? []) {
    const list = deadlinesByProperty.get(d.property_id) ?? [];
    list.push(d);
    deadlinesByProperty.set(d.property_id, list);
  }

  const rows: string[][] = [];
  for (const property of properties ?? []) {
    const propertyDeadlines = deadlinesByProperty.get(property.id) ?? [];
    const base = [
      property.nickname,
      property.city,
      property.state,
      property.permit_number ?? "",
      property.permit_issued_on ?? "",
      property.permit_expires_on ?? "",
      property.last_tax_filed_on ?? "",
    ];
    if (propertyDeadlines.length === 0) {
      rows.push([...base, "", "", "", ""]);
    } else {
      for (const d of propertyDeadlines) {
        rows.push([...base, d.title, d.kind, d.due_date, d.status]);
      }
    }
  }

  const csv = [HEADERS, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="permitly-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
