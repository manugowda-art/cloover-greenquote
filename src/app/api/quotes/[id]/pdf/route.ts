import { NextResponse } from "next/server";
import {
    PDFDocument,
    StandardFonts,
    rgb,
} from "pdf-lib";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-error";
import { Role } from "@/generated/prisma/client";
import type { Offer } from "@/lib/pricing";

function formatPdfCurrency(value: number) {
    return `EUR ${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const startedAt = Date.now();

    try {
        const session = await requireUser();
        const { id } = await params;

        const quoteId = Number(id);

        if (Number.isNaN(quoteId)) {
            return NextResponse.json(
                { error: "Invalid quote id" },
                { status: 400 }
            );
        }

        const quote = await db.quote.findUnique({
            where: {
                id: quoteId,
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        if (!quote) {
            return NextResponse.json(
                { error: "Quote not found" },
                { status: 404 }
            );
        }

        if (
            quote.userId !== session.userId &&
            session.role !== Role.ADMIN
        ) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const offers = JSON.parse(quote.offersJson) as Offer[];

        const pdf = await PDFDocument.create();

        const page = pdf.addPage([595.28, 841.89]);

        const regularFont = await pdf.embedFont(
            StandardFonts.Helvetica
        );

        const boldFont = await pdf.embedFont(
            StandardFonts.HelveticaBold
        );

        const { height } = page.getSize();

        let y = height - 60;

        const drawText = (
            text: string,
            options?: {
                size?: number;
                bold?: boolean;
                x?: number;
            }
        ) => {
            page.drawText(text, {
                x: options?.x ?? 50,
                y,
                size: options?.size ?? 11,
                font: options?.bold ? boldFont : regularFont,
                color: rgb(0.1, 0.1, 0.1),
            });

            y -= (options?.size ?? 11) + 8;
        };

        drawText("Cloover - GreenQuote", {
            size: 22,
            bold: true,
        });

        drawText("Solar financing pre-qualification", {
            size: 12,
        });

        y -= 10;

        drawText(`Quote #${quote.id}`, {
            size: 16,
            bold: true,
        });

        drawText(
            `Created: ${quote.createdAt.toLocaleDateString()}`
        );

        y -= 10;

        drawText("Customer", {
            size: 13,
            bold: true,
        });

        drawText(`Name: ${quote.user.fullName}`);
        drawText(`Email: ${quote.user.email}`);
        drawText(`Address: ${quote.address}`);

        y -= 10;

        drawText("Quote summary", {
            size: 13,
            bold: true,
        });

        drawText(
            `System size: ${quote.systemSizeKw} kW`
        );

        drawText(
            `Monthly consumption: ${quote.monthlyConsumptionKwh} kWh`
        );

        drawText(
            `System price: ${formatPdfCurrency(quote.systemPrice)}`
        );

        drawText(
            `Down payment: ${formatPdfCurrency(
                quote.downPayment ?? 0
            )}`
        );

        drawText(`Risk band: ${quote.riskBand}`);

        y -= 15;

        drawText("Financing offers", {
            size: 13,
            bold: true,
        });

        const tableTop = y;

        const columns = {
            term: 50,
            apr: 180,
            principal: 280,
            payment: 410,
        };

        page.drawText("Term", {
            x: columns.term,
            y: tableTop,
            size: 10,
            font: boldFont,
        });

        page.drawText("APR", {
            x: columns.apr,
            y: tableTop,
            size: 10,
            font: boldFont,
        });

        page.drawText("Principal", {
            x: columns.principal,
            y: tableTop,
            size: 10,
            font: boldFont,
        });

        page.drawText("Monthly", {
            x: columns.payment,
            y: tableTop,
            size: 10,
            font: boldFont,
        });

        y -= 22;

        for (const offer of offers) {
            page.drawText(`${offer.termYears} years`, {
                x: columns.term,
                y,
                size: 10,
                font: regularFont,
            });

            page.drawText(
                `${(offer.apr * 100).toFixed(1)}%`,
                {
                    x: columns.apr,
                    y,
                    size: 10,
                    font: regularFont,
                }
            );

            page.drawText(
                formatPdfCurrency(offer.principalUsed),
                {
                    x: columns.principal,
                    y,
                    size: 10,
                    font: regularFont,
                }
            );

            page.drawText(
                `${formatPdfCurrency(offer.monthlyPayment)} / month`,
                {
                    x: columns.payment,
                    y,
                    size: 10,
                    font: regularFont,
                }
            );

            y -= 22;
        }

        y -= 20;

        drawText(
            "This document is a pre-qualification quote and does not constitute a final financing offer.",
            {
                size: 9,
            }
        );

        const bytes = await pdf.save();

        return new NextResponse(Buffer.from(bytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="greenquote-${quote.id}.pdf"`,
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        return toErrorResponse(error, {
            method: "GET",
            path: "/api/quotes/[id]/pdf",
            startedAt,
        });
    }
}
