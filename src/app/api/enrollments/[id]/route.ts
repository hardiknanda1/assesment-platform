import { NextResponse, type NextRequest } from "next/server";
import { requireApiAdmin, requireApiUser } from "@/lib/auth";
import { readJson, withErrorHandling } from "@/lib/api";
import { getEnrollmentForActor, updateEnrollmentStatus } from "@/lib/services/enrollment.service";
import { UpdateEnrollmentSchema } from "@/lib/validations";

/** GET /api/enrollments/:id — owner or admin. */
export const GET = withErrorHandling(
  async (_request: NextRequest, ctx: RouteContext<"/api/enrollments/[id]">) => {
    const user = await requireApiUser();
    const { id } = await ctx.params;
    return NextResponse.json(await getEnrollmentForActor(user, id));
  },
);

/** PATCH /api/enrollments/:id — admin only; updates status (audited). */
export const PATCH = withErrorHandling(
  async (request: NextRequest, ctx: RouteContext<"/api/enrollments/[id]">) => {
    const admin = await requireApiAdmin();
    const { id } = await ctx.params;
    const input = UpdateEnrollmentSchema.parse(await readJson(request));
    return NextResponse.json(await updateEnrollmentStatus(admin, id, input));
  },
);
