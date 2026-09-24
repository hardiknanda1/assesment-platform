import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api";
import { getDashboardStats } from "@/lib/services/admin.service";

/** GET /api/admin/stats — admin dashboard aggregates. */
export const GET = withErrorHandling(async () => {
  const admin = await requireApiAdmin();
  return NextResponse.json(await getDashboardStats(admin));
});
