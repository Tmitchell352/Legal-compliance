import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Privacy Policy | Permitly" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <article className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed text-slate-300">
          <h1 className="text-3xl font-semibold text-slate-50">Privacy Policy</h1>
          <p className="mt-2 text-xs text-slate-500">
            Last updated: [DATE]. Placeholder template — replace bracketed fields and have it reviewed by a lawyer
            licensed in your jurisdiction (and checked against GDPR/CCPA if you serve those users) before relying on
            it commercially.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">What we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="text-slate-200">Account data:</span> email address and authentication data, handled by
              our database and auth provider, Supabase.
            </li>
            <li>
              <span className="text-slate-200">Property data you enter:</span> property nicknames, addresses, permit
              numbers and dates, and any documents you upload (permits, insurance certificates), stored in Supabase
              Storage.
            </li>
            <li>
              <span className="text-slate-200">Billing data:</span> subscription and payment details are handled by
              our payment processor, Stripe — we do not store your card number ourselves.
            </li>
            <li>
              <span className="text-slate-200">Email delivery data:</span> reminder emails are sent through our email
              provider, Resend.
            </li>
          </ul>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">How we use it</h2>
          <p className="mt-2">
            To operate the Service: authenticate you, generate and send you compliance deadline reminders, process
            subscription billing, and provide customer support. We do not sell your personal data.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">Third parties we use</h2>
          <p className="mt-2">
            Supabase (database, authentication, file storage), Stripe (payment processing), and Resend (transactional
            email). Each processes data on our behalf under its own privacy and security terms. Address details you
            enter are stored to compute your property&apos;s compliance calendar and are not shared beyond what&apos;s needed
            to operate the Service.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">Data retention and deletion</h2>
          <p className="mt-2">
            We retain your account and property data for as long as your account is active. You can delete a
            property (and its documents) at any time from the dashboard. To delete your account entirely, contact
            [SUPPORT EMAIL] and we will delete your data within a reasonable period, except where we&apos;re required to
            retain billing records by law.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">Your rights</h2>
          <p className="mt-2">
            Depending on where you live, you may have rights to access, correct, export, or delete your personal
            data, and to object to certain processing. Contact [SUPPORT EMAIL] to exercise these rights.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">Cookies</h2>
          <p className="mt-2">
            We use essential cookies to keep you signed in (via Supabase Auth session cookies). We do not currently
            use advertising or cross-site tracking cookies.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">Changes to this policy</h2>
          <p className="mt-2">
            We may update this policy from time to time. Material changes will be posted here with an updated date.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-100">Contact</h2>
          <p className="mt-2">Questions about this policy: [SUPPORT EMAIL].</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
