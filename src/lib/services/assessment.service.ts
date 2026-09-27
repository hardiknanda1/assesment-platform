import "server-only";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { AuthUser } from "@/lib/services/user.service";
import type { EnrollmentStatusValue } from "@/lib/constants";

/**
 * Where a student's assessment stands right now. The window is always
 * computed on the server so every student sees the same state.
 */
export type AssessmentAvailability =
  | { state: "live"; endsAt: Date | null }
  | { state: "upcoming"; startsAt: Date }
  | { state: "ended" }
  | { state: "unscheduled" }
  | { state: "ineligible" };

type WindowExam = { startTime: Date | null; endTime: Date | null; durationMinutes: number | null };

/** Closing time: `endTime` if set, otherwise `startTime + durationMinutes`. */
export function getExamWindowEnd(exam: WindowExam): Date | null {
  if (exam.endTime) return exam.endTime;
  if (exam.startTime && exam.durationMinutes) {
    return new Date(exam.startTime.getTime() + exam.durationMinutes * 60_000);
  }
  return null;
}

export function getAssessmentAvailability(
  enrollment: { status: EnrollmentStatusValue; exam: WindowExam },
  now: Date = new Date(),
): AssessmentAvailability {
  if (enrollment.status !== "CONFIRMED") return { state: "ineligible" };
  const { exam } = enrollment;
  if (!exam.startTime) return { state: "unscheduled" };
  if (now < exam.startTime) return { state: "upcoming", startsAt: exam.startTime };
  const endsAt = getExamWindowEnd(exam);
  if (endsAt && now >= endsAt) return { state: "ended" };
  return { state: "live", endsAt };
}

/**
 * Exam room lookup. Only the enrolled student may open their own exam —
 * unlike the confirmation page, admins are not let in.
 */
export async function getExamRoomEnrollment(user: AuthUser, applicationNumber: string) {
  const enrollment = await db.enrollment.findUnique({
    where: { applicationNumber: applicationNumber.toUpperCase() },
    include: {
      exam: {
        select: { id: true, code: true, name: true, startTime: true, endTime: true, durationMinutes: true },
      },
      student: { select: { name: true, userId: true } },
    },
  });
  if (!enrollment || enrollment.student.userId !== user.id) throw new NotFoundError("Enrollment");
  return enrollment;
}
