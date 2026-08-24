import { NextResponse } from "next/server";

import { ForbiddenError, UnauthorizedError } from "@/lib/auth";
import { logger } from "@/lib/logger";

type RequestContext = {
  method: string;
  path: string;
  startedAt?: number;
};

/**
 * Maps a thrown error to its HTTP response so that authorization failures are
 * never reported as server errors, and server errors are never reported as
 * authorization failures.
 */
export function toErrorResponse(error: unknown, context: RequestContext) {
  const durationMs = context.startedAt
    ? Date.now() - context.startedAt
    : undefined;

  if (error instanceof UnauthorizedError) {
    logger.warn(
      { ...context, status: 401, durationMs },
      "Unauthorized request"
    );

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (error instanceof ForbiddenError) {
    logger.warn(
      { ...context, status: 403, durationMs },
      "Forbidden request"
    );

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  logger.error(
    { err: error, ...context, status: 500, durationMs },
    "Request failed"
  );

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
