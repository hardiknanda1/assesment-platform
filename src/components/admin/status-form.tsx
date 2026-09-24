"use client";

import * as React from "react";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateStatusAction, type StatusFormState } from "@/app/admin/enrollments/[id]/actions";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ENROLLMENT_STATUSES, ENROLLMENT_STATUS_LABELS, type EnrollmentStatusValue } from "@/lib/constants";

export function StatusForm({ enrollmentId, status }: { enrollmentId: string; status: EnrollmentStatusValue }) {
  const action = updateStatusAction.bind(null, enrollmentId);
  const [state, formAction, pending] = useActionState<StatusFormState, FormData>(action, { status: "idle" });
  // Parent re-mounts this form (via `key`) when the saved status changes.
  const [value, setValue] = React.useState(status);

  React.useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <NativeSelect
        name="status"
        aria-label="Enrollment status"
        value={value}
        onChange={(e) => setValue(e.target.value as EnrollmentStatusValue)}
        disabled={pending}
        wrapperClassName="sm:w-48"
      >
        {ENROLLMENT_STATUSES.map((s) => (
          <NativeSelectOption key={s} value={s}>
            {ENROLLMENT_STATUS_LABELS[s]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Button type="submit" disabled={pending || value === status}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        Update status
      </Button>
    </form>
  );
}
