import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { requireUser } from "@/lib/auth";
import { quoteSchema } from "@/lib/validation/quote";
import { calculateQuote } from "@/lib/pricing";
import { Quote } from "@/generated/prisma/client";

export async function POST(request: Request) {
    const startedAt = Date.now();

    try {
        const session = await requireUser();

        const body = await request.json();
        const result = quoteSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: z.treeifyError(result.error) },
                { status: 400 }
            );
        }

        const calculation = calculateQuote(result.data);

        const quote: Quote = await db.quote.create({
            data: {
                userId: session.userId,
                address: result.data.address,
                monthlyConsumptionKwh: result.data.monthlyConsumptionKwh,
                systemSizeKw: result.data.systemSizeKw,
                downPayment: result.data.downPayment,
                systemPrice: calculation.systemPrice,
                riskBand: calculation.riskBand,
                offersJson: JSON.stringify(calculation.offers),
            },
        });

        logger.info(
            {
                method: "POST",
                path: "/api/quotes",
                status: 201,
                userId: session.userId,
                quoteId: quote.id,
                durationMs: Date.now() - startedAt,
            },
            "Quote created"
        );

        return NextResponse.json(
            {
                id: quote.id,
                systemPrice: quote.systemPrice,
                riskBand: quote.riskBand,
                offers: calculation.offers,
                createdAt: quote.createdAt,
            },
            { status: 201 }
        );
    } catch (error) {
        logger.error(
            {
                err: error,
                method: "POST",
                path: "/api/quotes",
                durationMs: Date.now() - startedAt,
            },
            "Quote creation failed"
        );

        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function GET() {
    try {
        const session = await requireUser();

        const quotes: Quote[] = await db.quote.findMany({
            where: {
                userId: session.userId,
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}