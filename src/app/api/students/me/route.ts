import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api";
import { getStudentDashboard } from "@/lib/services/student.service";

/** GET /api/students/me — the signed-in student's profile and enrollments. */
export const GET = withErrorHandling(async () => {
  const user = await requireApiUser();
  const student = await getStudentDashboard(user.id);
  return NextResponse.json({ student });
});
