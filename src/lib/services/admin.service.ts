import "server-only";
import { db } from "@/lib/db";
import { ForbiddenError } from "@/lib/errors";
import { siteConfig } from "@/config/site";
import { ENROLLMENT_STATUSES, type EnrollmentStatusValue } from "@/lib/constants";
import { isAdminRole, type AuthUser } from "@/lib/services/user.service";

const TREND_DAYS = 14;

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

/**
 * Aggregates for the admin dashboard. All counting happens in PostgreSQL;
 * nothing row-level is sent to the browser.
 */
export async function getDashboardStats(actor: AuthUser) {
  if (!isAdminRole(actor.role)) throw new ForbiddenError();

  const tz = siteConfig.timeZone;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalEnrollments,
    totalStudents,
    last7Days,
    openExams,
    byStatusRaw,
    byExamRaw,
    exams,
    byGradeRaw,
    topCitiesRaw,
    trendRaw,
    recent,
  ] = await Promise.all([
    db.enrollment.count(),
    db.student.count(),
    db.enrollment.count({ where: { enrolledAt: { gte: sevenDaysAgo } } }),
    db.exam.count({ where: { status: "OPEN" } }),
    db.enrollment.groupBy({ by: ["status"], _count: { _all: true } }),
    db.enrollment.groupBy({ by: ["examId"], _count: { _all: true } }),
    db.exam.findMany({ select: { id: true, code: true, name: true, status: true } }),
    db.student.groupBy({ by: ["grade"], _count: { _all: true } }),
    db.student.groupBy({
      by: ["city"],
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 5,
    }),
    db.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT to_char(date_trunc('day', enrolled_at AT TIME ZONE 'UTC' AT TIME ZONE ${tz}), 'YYYY-MM-DD') AS day,
             COUNT(*)::bigint AS count
      FROM enrollments
      WHERE enrolled_at >= NOW() - (${TREND_DAYS} * INTERVAL '1 day')
      GROUP BY 1
      ORDER BY 1`,
    db.enrollment.findMany({
      take: 6,
      orderBy: { enrolledAt: "desc" },
      select: {
        id: true,
        applicationNumber: true,
        enrolledAt: true,
        status: true,
        exam: { select: { code: true } },
        student: { select: { name: true, city: true } },
      },
    }),
  ]);

  const byStatus = Object.fromEntries(ENROLLMENT_STATUSES.map((s) => [s, 0])) as Record<
    EnrollmentStatusValue,
    number
  >;
  for (const row of byStatusRaw) byStatus[row.status] = row._count._all;

  const examCounts = new Map(byExamRaw.map((r) => [r.examId, r._count._all]));
  const byExam = exams
    .map((e) => ({ ...e, count: examCounts.get(e.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const byGrade = byGradeRaw
    .map((r) => ({ grade: r.grade, count: r._count._all }))
    .sort((a, b) => Number(a.grade) - Number(b.grade));

  const topCities = topCitiesRaw.map((r) => ({ city: r.city, count: r._count._all }));

  // Fill missing days with zero so the trend has a stable length.
  const trendMap = new Map(trendRaw.map((r) => [r.day, Number(r.count)]));
  const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const trend = Array.from({ length: TREND_DAYS }, (_, i) => {
    const d = new Date(now.getTime() - (TREND_DAYS - 1 - i) * 24 * 60 * 60 * 1000);
    const key = dayKey.format(d);
    return { day: key, count: trendMap.get(key) ?? 0 };
  });

  return {
    totals: {
      enrollments: totalEnrollments,
      students: totalStudents,
      last7Days,
      openExams,
    },
    byStatus,
    byExam,
    byGrade,
    topCities,
    trend,
    recent,
  };
}
