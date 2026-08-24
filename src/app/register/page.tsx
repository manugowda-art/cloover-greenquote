"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: form.get("fullName"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Registration failed");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Sign up to request solar financing pre-qualification.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Full name
          </label>
          <input
            name="fullName"
            type="text"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Minimum 8 characters.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-emerald-500 px-4 py-2 font-medium text-black hover:bg-emerald-400"
        >
          Create account
        </button>
      </form>

      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-emerald-400 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </main>
  );
}