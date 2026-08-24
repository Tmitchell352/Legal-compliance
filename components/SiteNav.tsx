import Link from "next/link";

export function SiteNav() {
  return (
    <header className="border-b border-slate-800/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-100">
          Permit<span className="text-amber-500">ly</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-slate-300 sm:flex">
          <Link href="/cities" className="hover:text-slate-100">
            Cities
          </Link>
          <Link href="/pricing" className="hover:text-slate-100">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-slate-100">
            Log in
          </Link>
        </div>
        <Link
          href="/signup"
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-400"
        >
          Start free
        </Link>
      </nav>
    </header>
  );
}
