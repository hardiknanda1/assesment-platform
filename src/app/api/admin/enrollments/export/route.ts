import type { NextRequest } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api";
import { countEnrollments, iterateEnrollmentsForExport } from "@/lib/services/enrollment.service";
import { recordAudit } from "@/lib/services/audit.service";
import { EnrollmentListQuerySchema, searchParamsToObject } from "@/lib/validations";
import { csvRow } from "@/lib/utils/csv";

const HEADER = [
  "Application Number",
  "Status",
  "Enrolled At (UTC)",
  "Exam Code",
  "Exam Name",
  "Student Name",
  "Email",
  "Phone",
  "School",
  "Grade",
  "City",
] as const;

/**
 * GET /api/admin/enrollments/export?q=&examId=&status=&grade=
 * Streams a CSV of all enrollments matching the current filters.
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const admin = await requireApiAdmin();
  const { q, examId, status, grade } = EnrollmentListQuerySchema.parse(
    searchParamsToObject(request.nextUrl.searchParams),
  );
  const filters = { q, examId, status, grade };

  const rowCount = await countEnrollments(admin, filters);
  await recordAudit({
    actorId: admin.id,
    action: "enrollment.exported",
    entityType: "enrollment",
    metadata: { filters, rowCount },
  });

  const encoder = new TextEncoder();
  const batches = iterateEnrollmentsForExport(admin, filters);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // BOM so Excel opens UTF-8 names correctly.
      controller.enqueue(encoder.encode("﻿" + csvRow(HEADER)));
    },
    async pull(controller) {
      try {
        const { value, done } = await batches.next();
        if (done) {
          controller.close();
          return;
        }
        let chunk = "";
        for (const e of value) {
          chunk += csvRow([
            e.applicationNumber,
            e.status,
            e.enrolledAt,
            e.exam.code,
            e.exam.name,
            e.student.name,
            e.student.user.email,
            e.student.phone,
            e.student.school,
            e.student.grade,
            e.student.city,
          ]);
        }
        controller.enqueue(encoder.encode(chunk));
      } catch (error) {
        console.error("[export] failed", error);
        controller.error(error);
      }
    },
    async cancel() {
      await batches.return(undefined);
    },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enrollments-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
