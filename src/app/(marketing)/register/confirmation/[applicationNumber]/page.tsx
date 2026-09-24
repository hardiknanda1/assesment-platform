import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock3, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { getEnrollmentByApplicationNumber } from "@/lib/services/enrollment.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import { EnrollmentStatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "Enrollment confirmed" };

export default async function ConfirmationPage({
  params,
}: PageProps<"/register/confirmation/[applicationNumber]">) {
  const { applicationNumber } = await params;
  const user = await requireUser(`/register/confirmation/${applicationNumber}`);

  const enrollment = await getEnrollmentByApplicationNumber(user, decodeURIComponent(applicationNumber)).catch(
    (error: unknown) => {
      if (error instanceof NotFoundError) notFound();
      throw error;
    },
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success/12 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">You&apos;re enrolled!</h1>
        <p className="mt-2 text-muted-foreground">
          Keep your application number handy — you&apos;ll need it on exam day.
        </p>
      </div>

      <Card className="mt-10 overflow-hidden py-0">
        <div className="bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_70%,var(--brand-2))] px-6 py-8 text-center text-primary-foreground">
          <p className="text-xs font-medium tracking-widest uppercase opacity-80">Application number</p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight sm:text-4xl" data-testid="application-number">
            {enrollment.applicationNumber}
          </p>
        </div>
        <CardContent className="space-y-5 py-6">
          <div className="flex justify-center">
            <CopyButton value={enrollment.applicationNumber} label="Copy number" />
          </div>
          <dl className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <Detail label="Candidate" value={enrollment.student.name} />
            <Detail label="Exam" value={enrollment.exam.name} />
            <Detail
              label="Exam date"
              value={formatDateTime(enrollment.exam.startTime, "To be announced")}
              icon={<CalendarClock className="size-4" />}
            />
            <Detail
              label="Duration"
              value={formatDuration(enrollment.exam.durationMinutes)}
              icon={<Clock3 className="size-4" />}
            />
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd>
                <EnrollmentStatusBadge status={enrollment.status} />
              </dd>
            </div>
          </dl>
          <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <Mail className="mt-0.5 size-4 shrink-0" />
            Exam instructions and your test link will appear on your dashboard before the exam.
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/dashboard">Go to my dashboard</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/register">Enroll in another exam</Link>
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
