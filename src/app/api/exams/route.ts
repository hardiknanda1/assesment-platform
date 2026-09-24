import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api";
import { listPublicExams } from "@/lib/services/exam.service";

/** GET /api/exams — public list of non-draft exams. */
export const GET = withErrorHandling(async () => {
  return NextResponse.json({ items: await listPublicExams() });
});
