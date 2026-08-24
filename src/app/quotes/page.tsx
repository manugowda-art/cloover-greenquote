import Link from "next/link";

import { db } from "@/lib/db";
import { LogoutButton } from "@/components/LogoutButton";
import { requirePageUser } from "@/lib/page-auth";

export default async function QuotesPage() {
  const session = await requirePageUser();

  const quotes = await db.quote.findMany({
    where: {
      userId: session.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Quotes</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Solar financing pre-qualification history.
          </p>
        </div>

        <Link
          href="/quotes/new"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400"
        >
          New Quote
        </Link>
        <LogoutButton />
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-400">You have no quotes yet.</p>

          <Link
            href="/quotes/new"
            className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
          >
            Create your first quote
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-300">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">System Size</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Risk Band</th>
                <th className="px-4 py-3 text-right font-medium">
                  Details
                </th>
              </tr>
            </thead>

            <tbody>
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-t border-zinc-800 bg-zinc-950"
                >
                  <td className="px-4 py-4 text-zinc-300">
                    {quote.createdAt.toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4">
                    {quote.systemSizeKw} kW
                  </td>

                  <td className="px-4 py-4 font-medium">
                    €
                    {quote.systemPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium">
                      Band {quote.riskBand}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="text-emerald-400 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}