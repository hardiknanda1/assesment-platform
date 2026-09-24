import { Badge } from "@/components/ui/badge";
import {
  ENROLLMENT_STATUS_LABELS,
  EXAM_STATUS_LABELS,
  type EnrollmentStatusValue,
  type ExamStatusValue,
} from "@/lib/constants";

const ENROLLMENT_VARIANT = {
  CONFIRMED: "success",
  PENDING: "warning",
  WAITLISTED: "secondary",
  CANCELLED: "destructive",
} as const satisfies Record<EnrollmentStatusValue, string>;

const EXAM_VARIANT = {
  DRAFT: "outline",
  OPEN: "success",
  CLOSED: "secondary",
  COMPLETED: "secondary",
} as const satisfies Record<ExamStatusValue, string>;

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatusValue }) {
  return <Badge variant={ENROLLMENT_VARIANT[status]}>{ENROLLMENT_STATUS_LABELS[status]}</Badge>;
}

export function ExamStatusBadge({ status }: { status: ExamStatusValue }) {
  return <Badge variant={EXAM_VARIANT[status]}>{EXAM_STATUS_LABELS[status]}</Badge>;
}
