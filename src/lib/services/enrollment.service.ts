import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import {
  BusinessRuleError,
  DuplicateEnrollmentError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import type { AuthUser } from "@/lib/services/user.service";
import { isAdminRole } from "@/lib/services/user.service";
import { upsertStudentProfile } from "@/lib/services/student.service";
import { recordAudit } from "@/lib/services/audit.service";
import {
  formatApplicationNumber,
  looksLikeApplicationNumber,
} from "@/lib/utils/application-number";
import type {
  EnrollmentFilters,
  EnrollmentInput,
  EnrollmentListQuery,
  UpdateEnrollmentInput,
} from "@/lib/validations";

function assertAdmin(actor: AuthUser) {
  if (!isAdminRole(actor.role)) throw new ForbiddenError();
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// ─── Student-facing ────────────────────────────────────────────────────────

export type EnrollmentResult = {
  enrollmentId: string;
  applicationNumber: string;
  examName: string;
};

/**
 * Enrolls the signed-in student in an exam.
 *
 * In one transaction:
 *   1. checks the exam is OPEN,
 *   2. creates/updates the student profile,
 *   3. rejects duplicates for the same student + exam,
 *   4. atomically increments the exam's application counter (row lock), and
 *   5. creates the enrollment with a server-generated application number.
 *
 * The (student_id, exam_id) unique constraint is the final guard against
 * concurrent double-submits.
 */
export async function enrollStudent(user: AuthUser, input: EnrollmentInput): Promise<EnrollmentResult> {
  if (user.role !== "STUDENT") {
    throw new BusinessRuleError("Admin accounts cannot enroll in exams. Sign in with a student account.", "ROLE_NOT_ALLOWED");
  }
  if (input.email !== user.email) {
    throw new BusinessRuleError("Please use the email address of your signed-in account.", "EMAIL_MISMATCH");
  }

  try {
    return await db.$transaction(
      async (tx) => {
        const exam = await tx.exam.findUnique({
          where: { id: input.examId },
          select: { id: true, name: true, status: true },
        });
        if (!exam) throw new NotFoundError("Exam");
        if (exam.status !== "OPEN") {
          throw new BusinessRuleError("Registration for this exam is not open.", "EXAM_NOT_OPEN");
        }

        const student = await upsertStudentProfile(user.id, input, tx);

        const existing = await tx.enrollment.findUnique({
          where: { studentId_examId: { studentId: student.id, examId: exam.id } },
          select: { applicationNumber: true },
        });
        if (existing) throw new DuplicateEnrollmentError(existing.applicationNumber);

        // Row-level lock on the exam serialises number issuance per exam.
        const { applicationSeq, code } = await tx.exam.update({
          where: { id: exam.id },
          data: { applicationSeq: { increment: 1 } },
          select: { applicationSeq: true, code: true },
        });

        const enrollment = await tx.enrollment.create({
          data: {
            studentId: student.id,
            examId: exam.id,
            applicationNumber: formatApplicationNumber(code, applicationSeq),
            status: "CONFIRMED",
          },
          select: { id: true, applicationNumber: true },
        });

        return {
          enrollmentId: enrollment.id,
          applicationNumber: enrollment.applicationNumber,
          examName: exam.name,
        };
      },
      { maxWait: 5_000, timeout: 10_000 },
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      // Lost a race with a concurrent submit from the same student.
      const existing = await db.enrollment.findFirst({
        where: { examId: input.examId, student: { userId: user.id } },
        select: { applicationNumber: true },
      });
      if (existing) throw new DuplicateEnrollmentError(existing.applicationNumber);
    }
    throw error;
  }
}

/** Exam ids the user is already enrolled in (used to disable options in the form). */
export async function getEnrolledExamIds(userId: string): Promise<string[]> {
  const rows = await db.enrollment.findMany({
    where: { student: { userId } },
    select: { examId: true },
  });
  return rows.map((r) => r.examId);
}

const ownerEnrollmentInclude = {
  exam: {
    select: { id: true, code: true, name: true, startTime: true, endTime: true, durationMinutes: true, status: true },
  },
  student: { select: { id: true, name: true, userId: true } },
} as const;

/** Confirmation page: only the owner (or an admin) may read an enrollment. */
export async function getEnrollmentByApplicationNumber(actor: AuthUser, applicationNumber: string) {
  const enrollment = await db.enrollment.findUnique({
    where: { applicationNumber: applicationNumber.toUpperCase() },
    include: ownerEnrollmentInclude,
  });
  if (!enrollment || (enrollment.student.userId !== actor.id && !isAdminRole(actor.role))) {
    throw new NotFoundError("Enrollment");
  }
  return enrollment;
}

/** API: owner or admin can read by id. */
export async function getEnrollmentForActor(actor: AuthUser, id: string) {
  if (isAdminRole(actor.role)) return getEnrollmentDetail(actor, id);
  const enrollment = await db.enrollment.findUnique({ where: { id }, include: ownerEnrollmentInclude });
  if (!enrollment || enrollment.student.userId !== actor.id) throw new NotFoundError("Enrollment");
  return enrollment;
}

// ─── Admin ─────────────────────────────────────────────────────────────────

function buildWhere(filters: EnrollmentFilters): Prisma.EnrollmentWhereInput {
  const where: Prisma.EnrollmentWhereInput = {};
  if (filters.examId) where.examId = filters.examId;
  if (filters.status) where.status = filters.status;

  const studentWhere: Prisma.StudentWhereInput = {};
  if (filters.grade) studentWhere.grade = filters.grade;

  const q = filters.q?.trim();
  if (q) {
    const contains = { contains: q, mode: "insensitive" as const };
    const or: Prisma.EnrollmentWhereInput[] = [
      { applicationNumber: { contains: q.toUpperCase() } },
      { student: { name: contains } },
      { student: { user: { email: contains } } },
    ];
    if (/^\+?\d[\d\s-]{3,}$/.test(q)) {
      or.push({ student: { phone: { contains: q.replace(/[^\d]/g, "") } } });
    }
    where.OR = looksLikeApplicationNumber(q)
      ? [{ applicationNumber: { startsWith: q.toUpperCase() } }, ...or.slice(1)]
      : or;
  }
  if (Object.keys(studentWhere).length) where.student = studentWhere;
  return where;
}

const listSelect = {
  id: true,
  applicationNumber: true,
  status: true,
  enrolledAt: true,
  exam: { select: { id: true, code: true, name: true } },
  student: {
    select: {
      id: true,
      name: true,
      phone: true,
      school: true,
      grade: true,
      city: true,
      user: { select: { email: true } },
    },
  },
} as const satisfies Prisma.EnrollmentSelect;

export type EnrollmentListItem = Prisma.EnrollmentGetPayload<{ select: typeof listSelect }>;

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

/** Server-side paginated, filtered enrollment list. Never loads the full table. */
export async function listEnrollments(
  actor: AuthUser,
  query: EnrollmentListQuery,
): Promise<Paginated<EnrollmentListItem>> {
  assertAdmin(actor);
  const where = buildWhere(query);
  const [total, items] = await db.$transaction([
    db.enrollment.count({ where }),
    db.enrollment.findMany({
      where,
      select: listSelect,
      orderBy: [{ enrolledAt: "desc" }, { id: "desc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);
  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    pageCount: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getEnrollmentDetail(actor: AuthUser, id: string) {
  assertAdmin(actor);
  const enrollment = await db.enrollment.findUnique({
    where: { id },
    include: {
      exam: true,
      student: {
        include: {
          user: { select: { id: true, email: true, createdAt: true } },
          enrollments: {
            where: { id: { not: id } },
            select: {
              id: true,
              applicationNumber: true,
              status: true,
              enrolledAt: true,
              exam: { select: { code: true, name: true } },
            },
            orderBy: { enrolledAt: "desc" },
          },
        },
      },
    },
  });
  if (!enrollment) throw new NotFoundError("Enrollment");
  return enrollment;
}

export type EnrollmentDetail = Awaited<ReturnType<typeof getEnrollmentDetail>>;

export async function updateEnrollmentStatus(actor: AuthUser, id: string, input: UpdateEnrollmentInput) {
  assertAdmin(actor);
  return db.$transaction(async (tx) => {
    const current = await tx.enrollment.findUnique({ where: { id }, select: { status: true } });
    if (!current) throw new NotFoundError("Enrollment");
    if (current.status === input.status) {
      return tx.enrollment.findUniqueOrThrow({ where: { id }, select: { id: true, status: true, applicationNumber: true } });
    }
    const updated = await tx.enrollment.update({
      where: { id },
      data: { status: input.status },
      select: { id: true, status: true, applicationNumber: true },
    });
    await recordAudit(
      {
        actorId: actor.id,
        action: "enrollment.status_updated",
        entityType: "enrollment",
        entityId: id,
        metadata: { from: current.status, to: input.status },
      },
      tx,
    );
    return updated;
  });
}

/**
 * Streams enrollments matching the filters in fixed-size batches using
 * keyset (cursor) pagination, so exports stay memory-bounded regardless of
 * table size.
 */
export async function* iterateEnrollmentsForExport(
  actor: AuthUser,
  filters: EnrollmentFilters,
  batchSize = 500,
): AsyncGenerator<EnrollmentListItem[]> {
  assertAdmin(actor);
  const where = buildWhere(filters);
  let cursor: string | undefined;
  for (;;) {
    const batch = await db.enrollment.findMany({
      where,
      select: listSelect,
      orderBy: [{ enrolledAt: "desc" }, { id: "desc" }],
      take: batchSize,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (batch.length === 0) return;
    yield batch;
    if (batch.length < batchSize) return;
    cursor = batch[batch.length - 1]!.id;
  }
}

export async function countEnrollments(actor: AuthUser, filters: EnrollmentFilters) {
  assertAdmin(actor);
  return db.enrollment.count({ where: buildWhere(filters) });
}
