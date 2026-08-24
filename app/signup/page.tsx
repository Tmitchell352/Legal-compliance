import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-8 text-sm font-semibold tracking-tight text-amber-500">
        Permitly
      </Link>
      <h1 className="text-2xl font-semibold text-slate-100">Start your free trial</h1>
      <p className="mt-1 text-sm text-slate-400">Free forever for your first property. No credit card required.</p>

      {params.error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {params.error}
        </p>
      )}

      <form action={signup} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-amber-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-amber-400"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-amber-500 hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
