import Link from "next/link";

import { QuoteForm } from "@/components/QuoteForm";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";

export default async function NewQuotePage() {
  const session = await requirePageUser();

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: {
      fullName: true,
      email: true,
    },
  });

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">New Quote</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Request a solar financing pre-qualification.
          </p>
        </div>

        <Link
          href="/quotes"
          className="text-sm text-emerald-400 hover:underline"
        >
          Back to Quotes
        </Link>
      </div>

      <QuoteForm
        fullName={user.fullName}
        email={user.email}
      />
    </main>
  );
}