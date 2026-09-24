"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { isAppError } from "@/lib/errors";
import { updateEnrollmentStatus } from "@/lib/services/enrollment.service";
import { UpdateEnrollmentSchema } from "@/lib/validations";

export type StatusFormState = { status: "idle" | "success" | "error"; message?: string };

export async function updateStatusAction(
  enrollmentId: string,
  _prev: StatusFormState,
  formData: FormData,
): Promise<StatusFormState> {
  const user = await getCurrentUser();
  if (!isAdmin(user)) return { status: "error", message: "You do not have permission to do that." };

  const parsed = UpdateEnrollmentSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return { status: "error", message: "Please choose a valid status." };

  try {
    await updateEnrollmentStatus(user!, enrollmentId, parsed.data);
  } catch (error) {
    if (isAppError(error)) return { status: "error", message: error.message };
    console.error("[admin] status update failed", error);
    return { status: "error", message: "Could not update the status. Please try again." };
  }

  revalidatePath(`/admin/enrollments/${enrollmentId}`);
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
  return { status: "success", message: "Status updated." };
}
