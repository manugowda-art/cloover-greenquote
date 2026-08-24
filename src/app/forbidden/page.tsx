import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-semibold">Access denied</h1>

      <p className="text-zinc-400">
        You do not have permission to access this page.
      </p>

      <Link
        href="/"
        className="text-emerald-400 hover:underline"
      >
        Back to Cloover - GreenQuote
      </Link>
    </main>
  );
}