import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Download, SearchX, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listEnrollments } from "@/lib/services/enrollment.service";
import { listAllExamsForAdmin } from "@/lib/services/exam.service";
import { EnrollmentListQuerySchema, searchParamsToObject } from "@/lib/validations";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { EnrollmentFilters } from "@/components/admin/enrollment-filters";
import { EnrollmentsTable } from "@/components/admin/enrollments-table";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Enrollments" };

export default async function EnrollmentsPage({ searchParams }: PageProps<"/admin/enrollments">) {
  const admin = await requireAdmin();
  const raw = searchParamsToObject(await searchParams);
  const query = EnrollmentListQuerySchema.parse(raw);

  const [result, exams] = await Promise.all([listEnrollments(admin, query), listAllExamsForAdmin()]);

  // Out-of-range page (e.g. after filters shrank the result set) → last page.
  if (result.items.length === 0 && result.total > 0 && query.page > result.pageCount) {
    const next = new URLSearchParams(raw);
    next.set("page", String(result.pageCount));
    redirect(`/admin/enrollments?${next}`);
  }

  const filterParams = new URLSearchParams();
  for (const key of ["q", "examId", "status", "grade"] as const) {
    const v = query[key];
    if (v) filterParams.set(key, v);
  }
  const hasFilters = filterParams.size > 0;
  const exportHref = `/api/admin/enrollments/export${hasFilters ? `?${filterParams}` : ""}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollments"
        description={`${formatNumber(result.total)} ${hasFilters ? "matching" : "total"} enrollment${result.total === 1 ? "" : "s"}`}
        actions={
          result.total === 0 ? (
            <Button variant="outline" disabled>
              <Download /> Export CSV
            </Button>
          ) : (
            <Button asChild variant="outline">
              <a href={exportHref} download>
                <Download /> Export CSV
              </a>
            </Button>
          )
        }
      />

      <EnrollmentFilters exams={exams} />

      {result.items.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="No enrollments match your filters"
            description="Try a different search term or clear the filters."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No enrollments yet"
            description="Student enrollments will appear here as soon as they register."
          />
        )
      ) : (
        <>
          <Card className="gap-0 overflow-hidden py-0">
            <EnrollmentsTable items={result.items} />
          </Card>
          <Pagination
            basePath="/admin/enrollments"
            params={raw}
            page={result.page}
            pageCount={result.pageCount}
            limit={result.limit}
            total={result.total}
          />
        </>
      )}
    </div>
  );
}
