"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { DuplicateEnrollmentError, isAppError } from "@/lib/errors";
import { enrollStudent } from "@/lib/services/enrollment.service";
import { EnrollmentSchema, type EnrollmentFieldErrors } from "@/lib/validations";

export type EnrollmentFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: EnrollmentFieldErrors;
  /** Set when the student is already enrolled in the selected exam. */
  existingApplicationNumber?: string;
  /** Echoed back so the form keeps the user's input after an error. */
  values?: Record<string, string>;
};

const FIELDS = ["name", "email", "phone", "school", "grade", "city", "examId"] as const;

export async function submitEnrollment(
  _prev: EnrollmentFormState,
  formData: FormData,
): Promise<EnrollmentFormState> {
  const values = Object.fromEntries(
    FIELDS.map((f) => [f, String(formData.get(f) ?? "")]),
  ) as Record<(typeof FIELDS)[number], string>;

  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Your session has expired. Please sign in again.", values };
  }

  const parsed = EnrollmentSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as EnrollmentFieldErrors,
      values,
    };
  }

  let applicationNumber: string;
  try {
    ({ applicationNumber } = await enrollStudent(user, parsed.data));
  } catch (error) {
    if (error instanceof DuplicateEnrollmentError) {
      return {
        status: "error",
        message: error.message,
        existingApplicationNumber: error.applicationNumber,
        values,
      };
    }
    if (isAppError(error)) {
      return { status: "error", message: error.message, values };
    }
    console.error("[enrollment] unexpected error", error);
    return { status: "error", message: "We couldn't complete your enrollment. Please try again.", values };
  }

  revalidatePath("/dashboard");
  redirect(`/register/confirmation/${encodeURIComponent(applicationNumber)}`);
}
