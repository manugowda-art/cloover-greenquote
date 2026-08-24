import Link from "next/link";

import { db } from "@/lib/db";
import { LogoutButton } from "@/components/LogoutButton";
import { requirePageAdmin } from "@/lib/page-auth";

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requirePageAdmin();

  const { search } = await searchParams;

  const quotes = await db.quote.findMany({
    where: search
      ? {
        user: {
          OR: [
            {
              fullName: {
                contains: search,
              },
            },
            {
              email: {
                contains: search,
              },
            },
          ],
        },
      }
      : undefined,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Admin Quotes</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Review all customer pre-qualification quotes.
          </p>
        </div>
        <LogoutButton />
      </div>

      <form className="flex gap-3">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or email"
          className="w-full max-w-md rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-500"
        />

        <button
          type="submit"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400"
        >
          Search
        </button>

        {search && (
          <Link
            href="/admin/quotes"
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
        </span>

        {search && (
          <span>
            Filter: <span className="text-zinc-200">{search}</span>
          </span>
        )}
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-400">
            No quotes found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-300">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Email</th>
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
                  <td className="px-4 py-4 font-medium">
                    {quote.user.fullName}
                  </td>

                  <td className="px-4 py-4 text-zinc-400">
                    {quote.user.email}
                  </td>

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