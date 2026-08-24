import Link from "next/link";
import { redirect } from "next/navigation";

import { QuoteForm } from "@/components/QuoteForm";
import { getSession } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

export default async function HomePage() {
  const session = await getSession();

  if (session?.role === Role.ADMIN) {
    redirect("/admin/quotes");
  }

  if (session?.role === Role.USER) {
    redirect("/quotes");
  }

  return (
    <main className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Cloover - GreenQuote</h1>
        <p className="text-zinc-400">
          Solar financing pre-qualification
        </p>
      </header>

      {!session ? (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="mb-4 text-zinc-300">
            Sign in or create an account to request a quote.
          </p>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
              Register
            </Link>
          </div>
        </section>
      ) : (
        <QuoteForm />
      )}
    </main>
  );
}