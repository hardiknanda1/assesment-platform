import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, CalendarPlus, GraduationCap, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/admin.service";
import { ENROLLMENT_STATUSES, ENROLLMENT_STATUS_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { BarList } from "@/components/admin/bar-list";
import { TrendChart } from "@/components/admin/trend-chart";
import { EnrollmentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatGrade } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats(admin);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Enrollment activity across all assessments."
        actions={
          <Button asChild>
            <Link href="/admin/enrollments">
              View enrollments <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total enrollments" value={stats.totals.enrollments} icon={BookOpenCheck} />
        <StatCard label="Registered students" value={stats.totals.students} icon={Users} />
        <StatCard label="New in last 7 days" value={stats.totals.last7Days} icon={CalendarPlus} />
        <StatCard label="Open exams" value={stats.totals.openExams} icon={GraduationCap} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Daily enrollments</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By status</CardTitle>
            <CardDescription>All enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={ENROLLMENT_STATUSES.map((s) => ({
                key: s,
                label: ENROLLMENT_STATUS_LABELS[s],
                value: stats.byStatus[s],
                href: `/admin/enrollments?status=${s}`,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>By exam</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList
              emptyLabel="No exams yet"
              items={stats.byExam.map((e) => ({
                key: e.id,
                label: (
                  <>
                    <span className="font-mono text-xs text-muted-foreground">{e.code}</span> {e.name}
                  </>
                ),
                value: e.count,
                href: `/admin/enrollments?examId=${e.id}`,
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By grade</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList
              items={stats.byGrade.map((g) => ({
                key: g.grade,
                label: formatGrade(g.grade),
                value: g.count,
                href: `/admin/enrollments?grade=${g.grade}`,
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top cities</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList items={stats.topCities.map((c) => ({ key: c.city, label: c.city, value: c.count }))} />
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 pb-0">
        <CardHeader className="border-b">
          <CardTitle>Recent enrollments</CardTitle>
          <CardAction>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/enrollments">
                See all <ArrowRight />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        {stats.recent.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No enrollments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Application</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recent.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="pl-6 font-mono text-xs">
                    <Link href={`/admin/enrollments/${e.id}`} className="hover:text-primary hover:underline">
                      {e.applicationNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{e.student.name}</TableCell>
                  <TableCell className="text-muted-foreground">{e.student.city}</TableCell>
                  <TableCell>
                    <EnrollmentStatusBadge status={e.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right text-muted-foreground">{formatDateTime(e.enrolledAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
