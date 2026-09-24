import { z } from "zod";
import { EXAM_STATUSES } from "@/lib/constants";

export const ExamStatusSchema = z.enum(EXAM_STATUSES);

/**
 * Exam definition. Used by the seed script today and by the future
 * admin "create exam" flow.
 */
export const ExamSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2,10}$/, { error: "Code must be 2–10 letters/digits." }),
    name: z.string().trim().min(3).max(150),
    description: z.string().trim().max(2000).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    durationMinutes: z.number().int().min(1).max(600).optional(),
    status: ExamStatusSchema.default("DRAFT"),
  })
  .refine((e) => !e.startTime || !e.endTime || e.endTime > e.startTime, {
    error: "End time must be after start time.",
    path: ["endTime"],
  });

export type ExamInput = z.infer<typeof ExamSchema>;
