import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Jurisdiction } from "@/types/database";
import { createProperty } from "./actions";

export default async function NewPropertyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: jurisdictions } = await supabase
    .from("jurisdictions")
    .select("*")
    .order("city", { ascending: true })
    .returns<Jurisdiction[]>();

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
        ← Back to properties
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-slate-100">Add a property</h1>
      <p className="mt-1 text-sm text-slate-400">
        We&apos;ll build its compliance calendar automatically from the city&apos;s requirements.
      </p>

      {params.error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {params.error}
        </p>
      )}

      <form action={createProperty} className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Nickname
          <input
            type="text"
            name="nickname"
            required
            placeholder="e.g. Downtown Loft"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          City
          <select
            name="jurisdiction_id"
            required
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
          >
            <option value="">Select a city...</option>
            {(jurisdictions ?? []).map((j) => (
              <option key={j.id} value={j.id}>
                {j.city}, {j.state}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500">
            Don&apos;t see your city?{" "}
            <a href="mailto:hello@permitly.app" className="text-amber-500 hover:underline">
              Request it
            </a>
            .
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Street address <span className="text-slate-500">(optional, kept private)</span>
          <input
            type="text"
            name="address_line"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Permit issued on
            <input
              type="date"
              name="permit_issued_on"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Permit expires on
            <input
              type="date"
              name="permit_expires_on"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Last tax filing date <span className="text-slate-500">(optional — defaults to today)</span>
          <input
            type="date"
            name="last_tax_filed_on"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-md bg-amber-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-amber-400"
        >
          Add property
        </button>
      </form>
    </div>
  );
}
