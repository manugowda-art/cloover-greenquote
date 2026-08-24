import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validation/auth";
import { logger } from "@/lib/logger";
import { User } from "@/generated/prisma/client";

export async function POST(request: Request) {
    const startedAt = Date.now();

    logger.info(
        {
            method: "POST",
            path: "/api/auth/register",
        },
        "Request received"
    );

    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }
        const { fullName, password, email } = result.data;

        const existingUser: User | null = await db.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 409 },
            )
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user: User = await db.user.create({
            data: {
                fullName: fullName,
                email: email,
                passwordHash
            }
        });

        await createSession(user);

        logger.info(
            {
                method: "POST",
                path: "/api/auth/register",
                status: 201,
                durationMs: Date.now() - startedAt,
                userId: user.id,
            },
            "Request completed"
        );

        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                },
            },
            { status: 201 }
        );
    } catch (error) {
        logger.error(
            {
                err: error,
                method: "POST",
                path: "/api/auth/register",
                status: 500,
                durationMs: Date.now() - startedAt,
            },
            "Request failed"
        );

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );

    }

}
