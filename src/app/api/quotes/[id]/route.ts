import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Quote, Role } from "@/generated/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;

    const quote: Quote | null = await db.quote.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user: {
          select: {
            id: true,
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

    return NextResponse.json({
      ...quote,
      offers: JSON.parse(quote.offersJson),
      offersJson: undefined,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}