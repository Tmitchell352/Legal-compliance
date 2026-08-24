import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Permitly. Not legal advice — always confirm requirements with your local authority.</p>
        <div className="flex gap-6">
          <Link href="/pricing" className="hover:text-slate-200">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-slate-200">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-slate-200">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
