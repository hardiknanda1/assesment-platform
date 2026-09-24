import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { getEnrollmentDetail } from "@/lib/services/enrollment.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import { EnrollmentStatusBadge, ExamStatusBadge } from "@/components/shared/status-badge";
import { StatusForm } from "@/components/admin/status-form";
import { formatDateTime, formatDuration, formatGrade, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Enrollment details" };

export default async function EnrollmentDetailPage({ params }: PageProps<"/admin/enrollments/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;

  const enrollment = await getEnrollmentDetail(admin, id).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });
  const { student, exam } = enrollment;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/enrollments">
          <ArrowLeft /> All enrollments
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            {initials(student.name)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{student.name}</h1>
            <p className="text-sm text-muted-foreground">{student.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5">
          <div>
            <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">Application no.</p>
            <p className="font-mono text-lg font-semibold">{enrollment.applicationNumber}</p>
          </div>
          <CopyButton value={enrollment.applicationNumber} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Enrollment</CardTitle>
            <CardDescription>Enrolled {formatDateTime(enrollment.enrolledAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Item label="Exam" value={`${exam.name} (${exam.code})`} />
              <div className="space-y-1">
                <dt className="text-xs text-muted-foreground">Exam status</dt>
                <dd>
                  <ExamStatusBadge status={exam.status} />
                </dd>
              </div>
              <Item label="Exam date" value={formatDateTime(exam.startTime, "To be announced")} />
              <Item label="Duration" value={formatDuration(exam.durationMinutes)} />
              <div className="space-y-1">
                <dt className="text-xs text-muted-foreground">Enrollment status</dt>
                <dd>
                  <EnrollmentStatusBadge status={enrollment.status} />
                </dd>
              </div>
              <Item label="Last updated" value={formatDateTime(enrollment.updatedAt)} />
            </dl>
            <div className="space-y-2 border-t pt-5">
              <p className="text-sm font-medium">Change status</p>
              <StatusForm key={enrollment.status} enrollmentId={enrollment.id} status={enrollment.status} />
              <p className="text-xs text-muted-foreground">Status changes are recorded in the audit log.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <Item label="Full name" value={student.name} />
              <Item label="Email" value={student.user.email} />
              <Item label="Phone" value={student.phone} />
              <Item label="School" value={student.school} />
              <Item label="Grade" value={formatGrade(student.grade)} />
              <Item label="City" value={student.city} />
              <Item label="Account created" value={formatDateTime(student.user.createdAt)} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Other enrollments</CardTitle>
          <CardDescription>Other exams this student is enrolled in.</CardDescription>
        </CardHeader>
        <CardContent>
          {student.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other enrollments.</p>
          ) : (
            <ul className="divide-y">
              {student.enrollments.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <Link href={`/admin/enrollments/${e.id}`} className="font-mono text-sm hover:text-primary hover:underline">
                    {e.applicationNumber}
                  </Link>
                  <span className="text-sm text-muted-foreground">{e.exam.name}</span>
                  <EnrollmentStatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words">{value}</dd>
    </div>
  );
}
