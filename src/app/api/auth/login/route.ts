// src/app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/auth";
import { logger } from "@/lib/logger";
import { User } from "@/generated/prisma/client";

export async function POST(request: Request) {
    const startedAt = Date.now();

    try {
        const body = await request.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: z.treeifyError(result.error) },
                { status: 400 }
            );
        }

        const email = result.data.email.trim().toLowerCase();

        const user: User | null = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            logger.warn(
                {
                    method: "POST",
                    path: "/api/auth/login",
                    status: 401,
                    durationMs: Date.now() - startedAt,
                },
                "Login failed"
            );

            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const passwordValid = await bcrypt.compare(
            result.data.password,
            user.passwordHash
        );

        if (!passwordValid) {
            logger.warn(
                {
                    method: "POST",
                    path: "/api/auth/login",
                    status: 401,
                    userId: user.id,
                    durationMs: Date.now() - startedAt,
                },
                "Login failed"
            );

            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        await createSession(user);

        logger.info(
            {
                method: "POST",
                path: "/api/auth/login",
                status: 200,
                userId: user.id,
                durationMs: Date.now() - startedAt,
            },
            "User logged in"
        );

        return NextResponse.json({
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error(
            {
                err: error,
                method: "POST",
                path: "/api/auth/login",
                status: 500,
                durationMs: Date.now() - startedAt,
            },
            "Login request failed"
        );

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}