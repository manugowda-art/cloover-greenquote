import { errors, SignJWT, jwtVerify } from "jose";
import { z } from 'zod';
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

import { User, Role } from "@/generated/prisma/browser"

const rawSecret = process.env.SESSION_SECRET;

if (!rawSecret) {
    throw new Error("SESSION_SECRET is not configured");
}

const SESSION_SECRET = new TextEncoder().encode(rawSecret);
const SESSION_COOKIE = "session";
const ALG = "HS256";
const JWT_EXPIRY = "1h";

const sessionSchema = z.object({
    userId: z.number(),
    email: z.email(),
    role: z.enum(Role),
});

type SessionPayload = z.infer<typeof sessionSchema>;

export async function createSession(user: User) {
    const payload: SessionPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRY)
        .sign(SESSION_SECRET);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
    });
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SESSION_SECRET, {
            algorithms: [ALG]
        });

        const parsed = sessionSchema.safeParse(payload);

        if (!parsed.success) {
            logger.warn("Invalid session payload");
            return null;
        }

        return parsed.data;
    } catch (error) {
        if (error instanceof errors.JWTExpired) {
            logger.info("Session token expired");
            return null;
        }

        if (
            error instanceof errors.JWTInvalid ||
            error instanceof errors.JWSInvalid ||
            error instanceof errors.JWSSignatureVerificationFailed
        ) {
            logger.warn(
                { err: error },
                "Invalid session token"
            );

            return null;
        }

        logger.error(
            { err: error },
            "Unexpected JWT verification error"
        );

        throw error;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) return null;

    return await verifyJWT(token);
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

export async function requireUser(): Promise<SessionPayload> {
    const session = await getSession();
    if (!session) {
        throw new UnauthorizedError();
    }
    return session;
}

export async function requireAdmin() {
    const user = await requireUser();

    if (user.role !== 'ADMIN') {
        throw new ForbiddenError();
    }

    return user;
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}