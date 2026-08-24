import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import type { ComplianceDeadline, DocumentRow, Jurisdiction, Property } from "@/types/database";
import { markDeadlineComplete, deleteProperty } from "./actions";
import { uploadDocument, deleteDocument } from "./documents-actions";

const DOCUMENTS_BUCKET = "property-documents";

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ doc_error?: string }>;
}) {
  const { id } = await params;
  const { doc_error } = await searchParams;
  const supabase = await createClient();

  const { data: property } = await supabase.from("properties").select("*").eq("id", id).single<Property>();
  if (!property) notFound();

  const { data: jurisdiction } = property.jurisdiction_id
    ? await supabase.from("jurisdictions").select("*").eq("id", property.jurisdiction_id).single<Jurisdiction>()
    : { data: null };

  const { data: deadlines } = await supabase
    .from("compliance_deadlines")
    .select("*")
    .eq("property_id", id)
    .order("due_date", { ascending: true })
    .returns<ComplianceDeadline[]>();

  const upcoming = (deadlines ?? []).filter((d) => d.status === "upcoming");
  const completed = (deadlines ?? []).filter((d) => d.status !== "upcoming");

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("property_id", id)
    .order("uploaded_at", { ascending: false })
    .returns<DocumentRow[]>();

  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data } = await supabase.storage.from(DOCUMENTS_BUCKET).createSignedUrl(doc.storage_path, 60 * 10);
      return { ...doc, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
        ← Back to properties
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{property.nickname}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {property.city}, {property.state}
            {property.address_line ? ` · ${property.address_line}` : ""}
          </p>
        </div>
        <form action={deleteProperty}>
          <input type="hidden" name="property_id" value={property.id} />
          <button type="submit" className="text-sm text-red-400 hover:text-red-300">
            Remove
          </button>
        </form>
      </div>

      {jurisdiction && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">
            {jurisdiction.city}, {jurisdiction.state} requirements
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {jurisdiction.permit_required && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Permit</dt>
                <dd className="mt-1 text-sm text-slate-200">{jurisdiction.permit_name}</dd>
                <dd className="text-xs text-slate-500">
                  Renews every {jurisdiction.permit_renewal_months} months · {jurisdiction.permit_authority}
                </dd>
                {jurisdiction.permit_url && (
                  <a
                    href={jurisdiction.permit_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-amber-500 hover:underline"
                  >
                    Official source ↗
                  </a>
                )}
              </div>
            )}
            {jurisdiction.tax_name && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Tax filing</dt>
                <dd className="mt-1 text-sm text-slate-200">{jurisdiction.tax_name}</dd>
                <dd className="text-xs text-slate-500 capitalize">
                  {jurisdiction.tax_filing_frequency?.replace("_", "-")} · {jurisdiction.tax_authority}
                </dd>
                {jurisdiction.tax_url && (
                  <a
                    href={jurisdiction.tax_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-amber-500 hover:underline"
                  >
                    Official source ↗
                  </a>
                )}
              </div>
            )}
          </dl>
          {jurisdiction.other_requirements && (
            <p className="mt-4 border-t border-slate-800 pt-4 text-xs text-slate-400">{jurisdiction.other_requirements}</p>
          )}
          <p className="mt-3 text-xs text-slate-600">
            Reference data last reviewed {new Date(jurisdiction.last_verified_on).toLocaleDateString()}. Not legal
            advice — confirm current requirements with {jurisdiction.permit_authority ?? "your local authority"}.
          </p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-100">Upcoming deadlines</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing upcoming — you&apos;re all caught up.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {upcoming.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">{d.title}</p>
                  <p className="text-xs text-slate-500">
                    Due {new Date(d.due_date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <DeadlineBadge dueDate={d.due_date} />
                  <form action={markDeadlineComplete}>
                    <input type="hidden" name="deadline_id" value={d.id} />
                    <input type="hidden" name="property_id" value={property.id} />
                    <button type="submit" className="text-xs text-slate-400 hover:text-slate-200">
                      Mark done
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {completed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-400">Completed</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {completed.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm text-slate-500">
                <span className="line-through">{d.title}</span>
                <span>{new Date(d.due_date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-100">Documents</h2>
        <p className="mt-1 text-sm text-slate-400">
          Keep the permit PDF, insurance certificate, and inspection reports for this property here.
        </p>

        {doc_error && (
          <p className="mt-3 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {doc_error}
          </p>
        )}

        {documentsWithUrls.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {documentsWithUrls.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
              >
                {doc.url ? (
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm text-slate-200 hover:text-amber-400">
                    {doc.name}
                  </a>
                ) : (
                  <span className="text-sm text-slate-500">{doc.name} (unavailable)</span>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                  <form action={deleteDocument}>
                    <input type="hidden" name="document_id" value={doc.id} />
                    <input type="hidden" name="property_id" value={property.id} />
                    <button type="submit" className="text-xs text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form action={uploadDocument} className="mt-4 flex items-center gap-3">
          <input type="hidden" name="property_id" value={property.id} />
          <input
            type="file"
            name="file"
            required
            accept="application/pdf,image/*"
            className="flex-1 text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-200 hover:file:bg-slate-700"
          />
          <button
            type="submit"
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
          >
            Upload
          </button>
        </form>
        <p className="mt-1 text-xs text-slate-600">PDF or image, up to 10MB.</p>
      </div>
    </div>
  );
}
