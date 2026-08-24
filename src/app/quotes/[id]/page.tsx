import Link from "next/link";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Quote, Role } from "@/generated/prisma/client";
import { notFound, redirect } from "next/navigation";
import { Offer } from "@/lib/pricing";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;

  const quote: Quote | null = await db.quote.findUnique({
    where: {
      id: Number(id),
    },
  });

  const backHref =
    session.role === Role.ADMIN
      ? "/admin/quotes"
      : "/quotes";

  if (!quote) notFound();

  if (
    quote.userId !== session.userId &&
    session.role !== Role.ADMIN
  ) {
    redirect("/");
  }

  const offers = JSON.parse(quote.offersJson);

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Quote #{quote.id}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Solar financing pre-qualification result
          </p>
        </div>

        <a
          href={`/api/quotes/${quote.id}/pdf`}
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
        >
          Download PDF
        </a>

        <Link
          href={backHref}
          className="text-sm text-emerald-400 hover:underline"
        >
          {session.role === Role.ADMIN
            ? "Back to Admin Quotes"
            : "Back to Quotes"}
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">System price</p>
          <p className="mt-1 text-2xl font-semibold">
            €{quote.systemPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Principal</p>
          <p className="mt-1 text-2xl font-semibold">
            €{offers[0].principalUsed.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Risk band</p>
          <p className="mt-1 text-2xl font-semibold">
            {quote.riskBand}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">APR</p>
          <p className="mt-1 text-2xl font-semibold">
            {(offers[0].apr * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Financing offers</h2>
          <p className="text-sm text-zinc-400">
            Compare available repayment terms.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-left">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-5 py-3">Term</th>
                <th className="px-5 py-3">Monthly payment</th>
              </tr>
            </thead>

            <tbody>
              {offers.map((offer: Offer) => (
                <tr
                  key={offer.termYears}
                  className="border-t border-zinc-800"
                >
                  <td className="px-5 py-4">
                    {offer.termYears} years
                  </td>

                  <td className="px-5 py-4 text-lg font-semibold">
                    €{offer.monthlyPayment.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="ml-1 text-sm font-normal text-zinc-500">
                      / month
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}