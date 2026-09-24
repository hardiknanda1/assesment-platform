import { z } from "zod";
import { DEFAULT_PAGE_SIZE, ENROLLMENT_STATUSES, GRADES, PAGE_SIZES } from "@/lib/constants";

/** Strips spaces, dashes, dots and parentheses; keeps a leading "+". */
function normalizePhone(value: string) {
  const trimmed = value.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

const nameField = z
  .string()
  .trim()
  .min(2, { error: "Please enter your full name." })
  .max(100, { error: "Name must be at most 100 characters." })
  .regex(/^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u, { error: "Name can only contain letters, spaces, . ' and -." });

/**
 * Student profile fields. Shared by the enrollment form and the
 * student-profile service.
 */
export const StudentSchema = z.object({
  name: nameField,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Please enter a valid email address." }).max(254)),
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(
      z.string().regex(/^\+?\d{10,15}$/, {
        error: "Enter a valid phone number (10–15 digits, optional country code).",
      }),
    ),
  school: z
    .string()
    .trim()
    .min(2, { error: "Please enter your school name." })
    .max(150, { error: "School name must be at most 150 characters." }),
  grade: z.enum(GRADES, { error: "Please select your grade." }),
  city: z
    .string()
    .trim()
    .min(2, { error: "Please enter your city." })
    .max(80, { error: "City must be at most 80 characters." }),
});

export type StudentInput = z.infer<typeof StudentSchema>;

/** Enrollment = student profile + the exam being enrolled in. */
export const EnrollmentSchema = StudentSchema.extend({
  examId: z.string().trim().min(1, { error: "Please select an exam." }).max(64),
});

export type EnrollmentInput = z.infer<typeof EnrollmentSchema>;
export type EnrollmentFieldErrors = Partial<Record<keyof EnrollmentInput, string[]>>;

export const EnrollmentStatusSchema = z.enum(ENROLLMENT_STATUSES);

export const UpdateEnrollmentSchema = z.object({
  status: EnrollmentStatusSchema,
});

export type UpdateEnrollmentInput = z.infer<typeof UpdateEnrollmentSchema>;

/**
 * Admin list query (search, filters, pagination). Parsed from URL search
 * params, so every field is lenient: invalid values fall back to defaults
 * instead of erroring.
 */
export const EnrollmentListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  examId: z.string().trim().max(64).optional().catch(undefined),
  status: EnrollmentStatusSchema.optional().catch(undefined),
  grade: z.enum(GRADES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).default(1).catch(1),
  limit: z.coerce
    .number()
    .int()
    .refine((n) => (PAGE_SIZES as readonly number[]).includes(n))
    .default(DEFAULT_PAGE_SIZE)
    .catch(DEFAULT_PAGE_SIZE),
});

export type EnrollmentListQuery = z.infer<typeof EnrollmentListQuerySchema>;
export type EnrollmentFilters = Omit<EnrollmentListQuery, "page" | "limit">;

/** Converts Next.js `searchParams` / URLSearchParams to a plain object (first value wins). */
export function searchParamsToObject(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (params instanceof URLSearchParams) {
    params.forEach((value, key) => {
      if (!(key in out) && value !== "") out[key] = value;
    });
    return out;
  }
  for (const [key, value] of Object.entries(params)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v !== undefined && v !== "") out[key] = v;
  }
  return out;
}
