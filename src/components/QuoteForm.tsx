"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";

type QuoteFormProps = {
    fullName: string;
    email: string;
};

export function QuoteForm({ fullName, email }: QuoteFormProps) {
    const router = useRouter();
    const [error, setError] = useState("");

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        const body = {
            address: form.get("address"),
            monthlyConsumptionKwh: Number(
                form.get("monthlyConsumptionKwh")
            ),
            systemSizeKw: Number(form.get("systemSizeKw")),
            downPayment: form.get("downPayment")
                ? Number(form.get("downPayment"))
                : undefined,
        };

        const response = await fetch("/api/quotes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        let data;
        try {
            data = await response.json();

            if (!response.ok) {
                setError(data.error ?? "Something went wrong");
                return;
            }
        } catch (error) {
            setError((error as Error).message ?? "Something went wrong");
        }

        router.push(`/quotes/${data.id}`);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
        >
            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label
                        htmlFor="fullName"
                        className="mb-1 block text-sm font-medium"
                    >
                        Full name
                    </label>

                    <input
                        id="fullName"
                        value={fullName}
                        readOnly
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-300"
                    />
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-300"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="address" className="mb-1 block text-sm font-medium">
                    Address
                </label>
                <input
                    id="address"
                    name="address"
                    required
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-500"
                />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label htmlFor="monthlyConsumptionKwh" className="mb-1 block text-sm font-medium">
                        Monthly consumption (kWh)
                    </label>
                    <input
                        id="monthlyConsumptionKwh"
                        name="monthlyConsumptionKwh"
                        type="number"
                        min="1"
                        required
                        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                    />
                </div>

                <div>
                    <label htmlFor="systemSizeKw" className="mb-1 block text-sm font-medium">
                        System size (kW)
                    </label>
                    <input
                        id="systemSizeKw"
                        name="systemSizeKw"
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="downPayment" className="mb-1 block text-sm font-medium">
                    Down payment (optional)
                </label>
                <input
                    id="downPayment"
                    name="downPayment"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
            </div>

            {error && (
                <p className="text-sm text-red-400">
                    {error}
                </p>
            )}

            <button
                type="submit"
                className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-black hover:bg-emerald-400"
            >
                Get pre-qualification
            </button>
        </form>
    );
}