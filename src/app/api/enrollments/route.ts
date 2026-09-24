import { NextResponse, type NextRequest } from "next/server";
import { requireApiAdmin, requireApiUser } from "@/lib/auth";
import { readJson, withErrorHandling } from "@/lib/api";
import { enrollStudent, listEnrollments } from "@/lib/services/enrollment.service";
import { EnrollmentListQuerySchema, EnrollmentSchema, searchParamsToObject } from "@/lib/validations";

/**
 * GET /api/enrollments?page=1&limit=25&q=&examId=&status=&grade=
 * Admin only. Server-side paginated.
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const admin = await requireApiAdmin();
  const query = EnrollmentListQuerySchema.parse(searchParamsToObject(request.nextUrl.searchParams));
  const result = await listEnrollments(admin, query);
  return NextResponse.json(result);
});

/**
 * POST /api/enrollments
 * Enrolls the signed-in student. Body: EnrollmentSchema.
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireApiUser();
  const input = EnrollmentSchema.parse(await readJson(request));
  const result = await enrollStudent(user, input);
  return NextResponse.json(result, { status: 201 });
});
