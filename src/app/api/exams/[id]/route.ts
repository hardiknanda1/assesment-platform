import { NextResponse, type NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api";
import { getPublicExam } from "@/lib/services/exam.service";

/** GET /api/exams/:id — accepts an exam id or exam code. */
export const GET = withErrorHandling(
  async (_request: NextRequest, ctx: RouteContext<"/api/exams/[id]">) => {
    const { id } = await ctx.params;
    return NextResponse.json(await getPublicExam(id));
  },
);
