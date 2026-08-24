import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Terms of Service | Permitly" };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <article className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed text-slate-300">
          <h1 className="text-3xl font-semibold text-slate-50">Terms of Service</h1>
          <p className="mt-2 text-xs text-slate-500">
            Last updated: [DATE]. Placeholder template — replace bracketed fields and have it reviewed by a lawyer
            licensed in your jurisdiction before relying on it commercially.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">1. What Permitly is</h2>
          <p className="mt-2">
            Permitly (&quot;we,&quot; &quot;us,&quot; the &quot;Service&quot;) is a subscription tool operated by [LEGAL ENTITY NAME], a company
            based in [JURISDICTION], that helps short-term rental hosts track permit renewals, tax filing dates, and
            related deadlines they enter or that we generate from reference data about their listed jurisdiction.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">2. Not legal advice</h2>
          <p className="mt-2">
            Permitly is an organizational and reminder tool, not a law firm, and using it does not create an
            attorney-client relationship. Jurisdiction requirements, deadlines, and reference content in the Service
            are provided for informational convenience only, may be incomplete, outdated, or inapplicable to your
            specific property, and must not be relied on as legal, tax, or compliance advice. You are solely
            responsible for confirming current requirements with the relevant government authority and, where
            appropriate, a licensed professional before acting or failing to act. We disclaim liability for any fine,
            penalty, lost income, or other loss connected to a missed, incorrect, or delayed deadline.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">3. Accounts</h2>
          <p className="mt-2">
            You must provide accurate information to create an account and are responsible for activity under your
            account and for keeping your credentials secure. You must be legally able to enter into this agreement.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">4. Subscriptions and billing</h2>
          <p className="mt-2">
            Paid plans are billed in advance on a recurring monthly basis through our payment processor, Stripe.
            Subscriptions renew automatically until canceled. You can cancel anytime from your account settings;
            cancellation takes effect at the end of the current billing period, and we do not provide prorated
            refunds for partial periods except where required by law. We may change our prices with notice; changes
            apply to your next billing cycle.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">5. Acceptable use</h2>
          <p className="mt-2">
            You agree not to misuse the Service — including attempting to access another user&apos;s data, disrupting the
            Service, scraping it at scale, or using it for any unlawful purpose.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">6. Termination</h2>
          <p className="mt-2">
            You may stop using the Service and delete your account at any time. We may suspend or terminate access
            for violation of these terms, non-payment, or as needed to protect the Service or other users.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">7. Disclaimer and limitation of liability</h2>
          <p className="mt-2">
            The Service is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law,
            [LEGAL ENTITY NAME] will not be liable for indirect, incidental, or consequential damages, or for any
            amount exceeding the fees you paid us in the twelve months before the claim arose.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">8. Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms from time to time. Material changes will be posted here with an updated date;
            continued use of the Service after changes take effect constitutes acceptance.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">9. Governing law</h2>
          <p className="mt-2">These terms are governed by the laws of [JURISDICTION], without regard to conflict-of-law rules.</p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">10. Contact</h2>
          <p className="mt-2">Questions about these terms: [SUPPORT EMAIL].</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
