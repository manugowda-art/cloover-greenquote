import { redirect } from "next/navigation";

import { requireUser, requireAdmin } from "@/lib/auth";

export async function requirePageUser() {
  try {
    return await requireUser();
  } catch {
    redirect("/login");
  }
}

export async function requirePageAdmin() {
  try {
    return await requireAdmin();
  } catch {
    redirect("/forbidden");
  }
}