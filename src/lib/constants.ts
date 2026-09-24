/**
 * Shared constants that are safe to import from both server and client code.
 * Enum values mirror the Prisma enums (kept in sync by the `satisfies` checks
 * in `src/lib/validations`).
 */

export const GRADES = ["6", "7", "8", "9", "10", "11", "12"] as const;
export type Grade = (typeof GRADES)[number];

export const ENROLLMENT_STATUSES = ["PENDING", "CONFIRMED", "WAITLISTED", "CANCELLED"] as const;
export type EnrollmentStatusValue = (typeof ENROLLMENT_STATUSES)[number];

export const EXAM_STATUSES = ["DRAFT", "OPEN", "CLOSED", "COMPLETED"] as const;
export type ExamStatusValue = (typeof EXAM_STATUSES)[number];

export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatusValue, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  WAITLISTED: "Waitlisted",
  CANCELLED: "Cancelled",
};

export const EXAM_STATUS_LABELS: Record<ExamStatusValue, string> = {
  DRAFT: "Draft",
  OPEN: "Registration open",
  CLOSED: "Registration closed",
  COMPLETED: "Completed",
};

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;
