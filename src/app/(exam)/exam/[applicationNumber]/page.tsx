import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, FileQuestion, Hourglass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { getAssessmentAvailability, getExamRoomEnrollment } from "@/lib/services/assessment.service";
import { assessmentHint } from "@/components/assessment/start-assessment-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "Exam room" };

/**
 * The exam room. Students land here from the "Start assessment" button.
 * The window is re-checked on the server, so a stale or hand-typed link
 * can't open the exam early or late.
 *
 * TODO(assessment-engine): create/resume the Attempt here and render the
 * question player (server-owned deadline, batched auto-save, submit).
 */
export default async function ExamRoomPage({ params }: PageProps<"/exam/[applicationNumber]">) {
  const { applicationNumber } = await params;
  const user = await requireUser(`/exam/${applicationNumber}`);

  const enrollment = await getExamRoomEnrollment(user, decodeURIComponent(applicationNumber)).catch(
    (error: unknown) => {
      if (error instanceof NotFoundError) notFound();
      throw error;
    },
  );
  const availability = getAssessmentAvailability(enrollment);
  const { exam } = enrollment;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{exam.name}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {enrollment.student.name} · <span className="font-mono">{enrollment.applicationNumber}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="size-4" /> {formatDuration(exam.durationMinutes)}
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            {availability.state === "live" ? <FileQuestion className="size-6" /> : <Hourglass className="size-6" />}
          </span>
          {availability.state === "live" ? (
            <>
              <h2 className="mt-5 text-xl font-semibold">You&apos;re in the exam room</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                The questions will appear here.
                {availability.endsAt ? ` The exam closes at ${formatDateTime(availability.endsAt)}.` : null}
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-5 text-xl font-semibold">This assessment isn&apos;t open</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{assessmentHint(availability)}</p>
              <Button asChild variant="outline" className="mt-8">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
