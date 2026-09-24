import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  Clock3,
  GraduationCap,
  Hourglass,
  MapPin,
  Phone,
  Plus,
  School,
  UserRound,
  ClipboardList,
  Mail,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStudentDashboard, type StudentDashboard } from "@/lib/services/student.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CopyButton } from "@/components/shared/copy-button";
import { EnrollmentStatusBadge, ExamStatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDateTime, formatDuration, formatGrade, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const student = await getStudentDashboard(user.id);

  if (!student || student.enrollments.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title="Welcome!" description={`Signed in as ${user.email}`} />
        <EmptyState
          icon={ClipboardList}
          title="You haven't enrolled in an assessment yet"
          description="Complete the enrollment form to get your application number. It only takes a couple of minutes."
          action={
            <Button asChild size="lg">
              <Link href="/register">Enroll now</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const firstName = student.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hi, ${firstName} 👋`}
        description="Here's everything about your enrollment and upcoming assessment."
        actions={
          <Button asChild variant="outline">
            <Link href="/register">
              <Plus /> Enroll in another exam
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {student.enrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
          <AssessmentPlaceholder />
        </div>
        <ProfileCard student={student} />
      </div>
    </div>
  );
}

type DashboardEnrollment = StudentDashboard["enrollments"][number];

function EnrollmentCard({ enrollment }: { enrollment: DashboardEnrollment }) {
  const { exam } = enrollment;
  return (
    <Card className="overflow-hidden py-0">
      <div className="flex flex-col gap-4 border-b bg-gradient-to-br from-primary/8 via-transparent to-brand-2/8 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{exam.name}</h2>
            <EnrollmentStatusBadge status={enrollment.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Enrolled on {formatDate(enrollment.enrolledAt)}</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-background px-4 py-2.5">
          <div>
            <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">Application no.</p>
            <p className="font-mono text-lg font-semibold tracking-tight">{enrollment.applicationNumber}</p>
          </div>
          <CopyButton value={enrollment.applicationNumber} label="Copy" />
        </div>
      </div>
      <CardContent className="grid gap-5 py-6 sm:grid-cols-3">
        <InfoItem icon={CalendarClock} label="Exam date" value={formatDateTime(exam.startTime, "To be announced")} />
        <InfoItem icon={Clock3} label="Duration" value={formatDuration(exam.durationMinutes)} />
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Exam status</p>
          <ExamStatusBadge status={exam.status} />
        </div>
        {exam.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground sm:col-span-3">{exam.description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AssessmentPlaceholder() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Hourglass className="size-5" />
        </span>
        <div className="flex-1">
          <h3 className="font-semibold">Your online assessment</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The test will be available here on exam day. You&apos;ll be able to start it with one click — no extra
            software needed.
          </p>
        </div>
        <Button variant="secondary" disabled>
          Not yet available
        </Button>
      </CardContent>
    </Card>
  );
}

function ProfileCard({ student }: { student: StudentDashboard }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
            {initials(student.name)}
          </span>
          <div className="min-w-0">
            <CardTitle className="truncate">{student.name}</CardTitle>
            <CardDescription className="truncate">{student.user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoItem icon={UserRound} label="Full name" value={student.name} />
        <InfoItem icon={Mail} label="Email" value={student.user.email} />
        <InfoItem icon={Phone} label="Phone" value={student.phone} />
        <InfoItem icon={School} label="School" value={student.school} />
        <InfoItem icon={GraduationCap} label="Grade" value={formatGrade(student.grade)} />
        <InfoItem icon={MapPin} label="City" value={student.city} />
      </CardContent>
    </Card>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
