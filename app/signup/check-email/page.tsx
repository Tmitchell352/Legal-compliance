import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-100">Check your inbox</h1>
      <p className="mt-2 text-sm text-slate-400">
        We sent you a confirmation link. Click it to activate your account, then log in.
      </p>
      <Link href="/login" className="mt-6 text-sm text-amber-500 hover:underline">
        Back to login
      </Link>
    </main>
  );
}
