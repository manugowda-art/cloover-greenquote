import { NextResponse } from "next/server";

import { deleteSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST() {
  await deleteSession();

  logger.info(
    {
      method: "POST",
      path: "/api/auth/logout",
      status: 200,
    },
    "User logged out"
  );

  return NextResponse.json({
    success: true,
  });
}