import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Quote } from "@/generated/prisma/client";

export async function GET(request: Request) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim();

        const quotes: Quote[] = await db.quote.findMany({
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

        return NextResponse.json({
            quotes: quotes.map((quote) => ({
                ...quote,
                offers: JSON.parse(quote.offersJson),
                offersJson: undefined,
            })),
        });
    } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
}