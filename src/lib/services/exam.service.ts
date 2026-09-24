import "server-only";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

/** Fields that are safe to expose publicly. */
const publicExamSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  startTime: true,
  endTime: true,
  durationMinutes: true,
  status: true,
} as const;

export type PublicExam = Awaited<ReturnType<typeof listPublicExams>>[number];

/** Exams visible to students (everything except drafts). */
export async function listPublicExams() {
  return db.exam.findMany({
    where: { status: { not: "DRAFT" } },
    select: publicExamSelect,
    orderBy: [{ startTime: "asc" }, { name: "asc" }],
  });
}

/** Exams currently accepting enrollments. */
export async function listOpenExams() {
  return db.exam.findMany({
    where: { status: "OPEN" },
    select: publicExamSelect,
    orderBy: [{ startTime: "asc" }, { name: "asc" }],
  });
}

export async function getPublicExam(idOrCode: string) {
  const exam = await db.exam.findFirst({
    where: {
      status: { not: "DRAFT" },
      OR: [{ id: idOrCode }, { code: idOrCode.toUpperCase() }],
    },
    select: publicExamSelect,
  });
  if (!exam) throw new NotFoundError("Exam");
  return exam;
}

/** All exams (including drafts) for admin filters. */
export async function listAllExamsForAdmin() {
  return db.exam.findMany({
    select: { id: true, code: true, name: true, status: true },
    orderBy: [{ createdAt: "desc" }],
  });
}
