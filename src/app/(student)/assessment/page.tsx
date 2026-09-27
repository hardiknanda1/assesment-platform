import type { Metadata } from "next";
import Link from "next/link";
import { LaptopMinimal, Timer, Save, Wifi } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStudentDashboard } from "@/lib/services/student.service";
import { getAssessmentAvailability } from "@/lib/services/assessment.service";
import { StartAssessmentButton, assessmentHint } from "@/components/assessment/start-assessment-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Assessment" };

/**
 * Assessment lobby: one row per enrollment with a Start button that opens
 * the exam room (`/exam/[applicationNumber]`) while the window is live.
 */
export default async function AssessmentPage() {
  const user = await requireUser("/assessment");
  const student = await getStudentDashboard(user.id);
  const enrollments = student?.enrollments.filter((e) => e.status !== "CANCELLED") ?? [];

  return (
    <div className="space-y-8">
      <PageHeader title="Online assessment" description="Start your test here when the exam window opens." />

      {enrollments.length === 0 ? (
        <EmptyState
          icon={LaptopMinimal}
          title="No assessments yet"
          description="Enroll in an exam to see it here."
          action={
            <Button asChild size="lg">
              <Link href="/register">Enroll now</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const availability = getAssessmentAvailability(enrollment);
            return (
              <Card key={enrollment.id}>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{enrollment.exam.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-mono">{enrollment.applicationNumber}</span> ·{" "}
                      {formatDateTime(enrollment.exam.startTime, "Date to be announced")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{assessmentHint(availability)}</p>
                  </div>
                  <StartAssessmentButton
                    applicationNumber={enrollment.applicationNumber}
                    availability={availability}
                    size="lg"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Timer, title: "Server-timed", body: "Everyone gets exactly the same time." },
          { icon: Save, title: "Auto-saved", body: "Answers are saved as you go." },
          { icon: Wifi, title: "Resilient", body: "Reconnect and continue after a network drop." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border p-4">
            <Icon className="size-4 text-primary" />
            <p className="mt-2 text-sm font-medium">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
