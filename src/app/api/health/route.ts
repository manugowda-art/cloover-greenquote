import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET() {
  logger.info(
    {
      method: "GET",
      path: "/api/health",
      status: 200,
    },
    "Health check"
  );

  return NextResponse.json({
    status: "ok",
  });
}