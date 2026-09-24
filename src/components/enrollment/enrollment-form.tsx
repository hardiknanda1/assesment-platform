"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { submitEnrollment, type EnrollmentFormState } from "@/app/(marketing)/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GRADES } from "@/lib/constants";
import { EnrollmentSchema, type EnrollmentFieldErrors, type EnrollmentInput } from "@/lib/validations/enrollment";
import { cn, formatDate } from "@/lib/utils";

export type EnrollmentFormExam = {
  id: string;
  code: string;
  name: string;
  startTime: Date | string | null;
  alreadyEnrolled: boolean;
};

type Defaults = Partial<Record<keyof EnrollmentInput, string>>;

const initialState: EnrollmentFormState = { status: "idle" };

export function EnrollmentForm({
  exams,
  defaults,
  preselectedExamId,
}: {
  exams: EnrollmentFormExam[];
  defaults: Defaults;
  preselectedExamId?: string;
}) {
  const [state, formAction, pending] = useActionState(submitEnrollment, initialState);
  const [clientErrors, setClientErrors] = React.useState<EnrollmentFieldErrors | null>(null);

  const errors = clientErrors ?? state.fieldErrors ?? {};
  const values: Defaults = { ...defaults, ...(state.values ?? {}) };
  const firstSelectable = exams.find((e) => !e.alreadyEnrolled)?.id;
  const selectedExam = values.examId ?? preselectedExamId ?? firstSelectable ?? "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = EnrollmentSchema.safeParse(data);
    if (!parsed.success) {
      event.preventDefault();
      setClientErrors(z.flattenError(parsed.error).fieldErrors as EnrollmentFieldErrors);
      const firstField = String(parsed.error.issues[0]?.path[0] ?? "");
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>(`[name="${firstField}"]`);
      firstInvalid?.focus();
    } else {
      setClientErrors(null);
    }
  }

  function clearError(field: keyof EnrollmentInput) {
    if (clientErrors?.[field]) setClientErrors({ ...clientErrors, [field]: undefined });
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-8">
      {state.status === "error" && state.message && !clientErrors ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{state.existingApplicationNumber ? "Already enrolled" : "We couldn't submit your enrollment"}</AlertTitle>
          <AlertDescription>
            <p>{state.message}</p>
            {state.existingApplicationNumber ? (
              <Link
                className="font-medium text-foreground underline underline-offset-4"
                href={`/register/confirmation/${encodeURIComponent(state.existingApplicationNumber)}`}
              >
                View application {state.existingApplicationNumber}
              </Link>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="space-y-4" disabled={pending}>
        <legend className="text-sm font-semibold">Assessment</legend>
        <Field label="Exam" name="examId" errors={errors.examId}>
          <NativeSelect
            id="examId"
            name="examId"
            defaultValue={selectedExam}
            aria-invalid={!!errors.examId}
            aria-describedby={errors.examId ? "examId-error" : undefined}
            onChange={() => clearError("examId")}
          >
            <NativeSelectOption value="" disabled>
              Select an exam
            </NativeSelectOption>
            {exams.map((exam) => (
              <NativeSelectOption key={exam.id} value={exam.id} disabled={exam.alreadyEnrolled}>
                {exam.name}
                {exam.startTime ? ` — ${formatDate(exam.startTime)}` : ""}
                {exam.alreadyEnrolled ? " (already enrolled)" : ""}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </fieldset>

      <fieldset className="space-y-4" disabled={pending}>
        <legend className="text-sm font-semibold">Your details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="name" errors={errors.name} className="sm:col-span-2">
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="e.g. Aarav Sharma"
              defaultValue={values.name}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              onChange={() => clearError("name")}
            />
          </Field>
          <Field
            label="Email"
            name="email"
            errors={errors.email}
            hint="Linked to your account and used for all exam communication."
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={values.email}
              readOnly
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : "email-hint"}
            />
          </Field>
          <Field label="Phone" name="phone" errors={errors.phone}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              defaultValue={values.phone}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              onChange={() => clearError("phone")}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4" disabled={pending}>
        <legend className="text-sm font-semibold">School</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="School name" name="school" errors={errors.school} className="sm:col-span-2">
            <Input
              id="school"
              name="school"
              autoComplete="organization"
              placeholder="e.g. Delhi Public School"
              defaultValue={values.school}
              aria-invalid={!!errors.school}
              aria-describedby={errors.school ? "school-error" : undefined}
              onChange={() => clearError("school")}
            />
          </Field>
          <Field label="Grade" name="grade" errors={errors.grade}>
            <NativeSelect
              id="grade"
              name="grade"
              defaultValue={values.grade ?? ""}
              aria-invalid={!!errors.grade}
              aria-describedby={errors.grade ? "grade-error" : undefined}
              onChange={() => clearError("grade")}
            >
              <NativeSelectOption value="" disabled>
                Select grade
              </NativeSelectOption>
              {GRADES.map((g) => (
                <NativeSelectOption key={g} value={g}>
                  Class {g}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field label="City" name="city" errors={errors.city}>
            <Input
              id="city"
              name="city"
              autoComplete="address-level2"
              placeholder="e.g. Pune"
              defaultValue={values.city}
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
              onChange={() => clearError("city")}
            />
          </Field>
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          By enrolling you confirm these details are accurate. You can enroll in each exam once.
        </p>
        <Button type="submit" size="lg" disabled={pending} className="sm:min-w-44">
          {pending ? (
            <>
              <Loader2 className="animate-spin" /> Submitting…
            </>
          ) : (
            "Submit enrollment"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  errors,
  hint,
  className,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {errors?.length ? (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {errors[0]}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
