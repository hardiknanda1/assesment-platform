import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX2, ClipboardCheck, ShieldAlert } from "lucide-react";
import { requireUser, isAdmin } from "@/lib/auth";
import { listOpenExams } from "@/lib/services/exam.service";
import { getStudentByUserId } from "@/lib/services/student.service";
import { getEnrolledExamIds } from "@/lib/services/enrollment.service";
import { EnrollmentForm } from "@/components/enrollment/enrollment-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Enroll" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const user = await requireUser("/register");
  const { exam: examParam } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Enroll for the assessment</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in your details below. Your application number is generated as soon as you submit.
        </p>
      </div>
      {isAdmin(user) ? <AdminNotice /> : <RegisterContent userId={user.id} email={user.email} examParam={examParam} />}
    </div>
  );
}

async function RegisterContent({
  userId,
  email,
  examParam,
}: {
  userId: string;
  email: string;
  examParam: string | string[] | undefined;
}) {
  const [exams, student, enrolledIds] = await Promise.all([
    listOpenExams(),
    getStudentByUserId(userId),
    getEnrolledExamIds(userId),
  ]);

  if (exams.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Registrations are currently closed"
        description="There are no assessments open for enrollment right now. Please check back soon."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        }
      />
    );
  }

  const enrolled = new Set(enrolledIds);
  const formExams = exams.map((e) => ({
    id: e.id,
    code: e.code,
    name: e.name,
    startTime: e.startTime,
    alreadyEnrolled: enrolled.has(e.id),
  }));

  if (formExams.every((e) => e.alreadyEnrolled)) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="You're enrolled in every open assessment"
        description="Your application numbers and exam details are on your dashboard."
        action={
          <Button asChild>
            <Link href="/dashboard">View my dashboard</Link>
          </Button>
        }
      />
    );
  }

  const code = typeof examParam === "string" ? examParam.toUpperCase() : undefined;
  const preselected = formExams.find((e) => (e.code === code || e.id === examParam) && !e.alreadyEnrolled)?.id;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Enrollment form</CardTitle>
        <CardDescription>All fields are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <EnrollmentForm
          exams={formExams}
          preselectedExamId={preselected}
          defaults={{
            email,
            name: student?.name,
            phone: student?.phone,
            school: student?.school,
            grade: student?.grade,
            city: student?.city,
          }}
        />
      </CardContent>
    </Card>
  );
}

function AdminNotice() {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="You're signed in as an admin"
      description="Admin accounts can't enroll in exams. Use a separate student account to test the enrollment flow."
      action={
        <Button asChild>
          <Link href="/admin">Go to admin panel</Link>
        </Button>
      }
    />
  );
}
