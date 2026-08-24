import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { TIER_LIMITS } from "@/types/database";

const PLANS = [
  {
    tier: "free" as const,
    tagline: "Try it on your first property",
    cta: { href: "/signup", label: "Start free" },
    features: ["1 property", "Full compliance calendar", "Email reminders", "Document vault"],
  },
  {
    tier: "pro" as const,
    tagline: "For hosts running a few units",
    cta: { href: "/api/stripe/checkout?plan=pro", label: "Upgrade to Pro" },
    highlight: true,
    features: [
      "Up to 5 properties",
      "Everything in Free",
      "Priority regulation-change alerts",
      "Multi-property renewal calendar",
    ],
  },
  {
    tier: "portfolio" as const,
    tagline: "For property managers & investors",
    cta: { href: "/api/stripe/checkout?plan=portfolio", label: "Upgrade to Portfolio" },
    features: [
      "Up to 25 properties",
      "Everything in Pro",
      "CSV export for accountants",
      "Early access to new markets",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pb-12 pt-16 text-center">
          <h1 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Simple pricing, per host</h1>
          <p className="mt-3 text-slate-400">
            One missed permit renewal or tax filing costs more than years of Permitly. Cancel anytime.
          </p>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const info = TIER_LIMITS[plan.tier];
            return (
              <div
                key={plan.tier}
                className={`flex flex-col rounded-2xl border p-6 ${
                  plan.highlight ? "border-amber-500 bg-slate-900/80 shadow-lg shadow-amber-500/10" : "border-slate-800 bg-slate-900/40"
                }`}
              >
                {plan.highlight && (
                  <span className="mb-3 w-fit rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                    Most popular
                  </span>
                )}
                <h2 className="text-lg font-semibold text-slate-100">{info.label}</h2>
                <p className="mt-1 text-sm text-slate-400">{plan.tagline}</p>
                <p className="mt-5 text-3xl font-semibold text-slate-50">
                  ${info.priceMonthly}
                  <span className="text-base font-normal text-slate-500">/mo</span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-slate-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.cta.href}
                  className={`mt-6 rounded-md px-4 py-2 text-center text-sm font-medium transition ${
                    plan.highlight
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                      : "border border-slate-700 text-slate-200 hover:border-slate-500"
                  }`}
                >
                  {plan.cta.label}
                </Link>
              </div>
            );
          })}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
