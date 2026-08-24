"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Login failed");
      return;
    }

    if (data.user.role === "ADMIN") {
      router.push("/admin/quotes");
    } else {
      router.push("/");
    }

    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Sign in to manage your GreenQuote requests.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-emerald-500 px-4 py-2 font-medium text-black hover:bg-emerald-400"
        >
          Sign in
        </button>
      </form>

      <p className="text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-emerald-400 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </main>
  );
}