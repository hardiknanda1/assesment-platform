import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { EnrollmentListItem } from "@/lib/services/enrollment.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrollmentStatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatGrade } from "@/lib/utils";

export function EnrollmentsTable({ items }: { items: EnrollmentListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Application no.</TableHead>
          <TableHead>Student</TableHead>
          <TableHead className="hidden md:table-cell">School</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead className="hidden lg:table-cell">City</TableHead>
          <TableHead>Exam</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden xl:table-cell">Enrolled</TableHead>
          <TableHead className="w-10 pr-5">
            <span className="sr-only">View</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((e) => {
          const href = `/admin/enrollments/${e.id}`;
          return (
            <TableRow key={e.id} className="group">
              <TableCell className="pl-5 font-mono text-xs font-medium">
                <Link href={href} className="hover:text-primary hover:underline">
                  {e.applicationNumber}
                </Link>
              </TableCell>
              <TableCell>
                <div className="font-medium">{e.student.name}</div>
                <div className="text-xs text-muted-foreground">{e.student.user.email}</div>
              </TableCell>
              <TableCell className="hidden max-w-56 truncate md:table-cell">{e.student.school}</TableCell>
              <TableCell>{formatGrade(e.student.grade)}</TableCell>
              <TableCell className="hidden lg:table-cell">{e.student.city}</TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">{e.exam.code}</span>
              </TableCell>
              <TableCell>
                <EnrollmentStatusBadge status={e.status} />
              </TableCell>
              <TableCell className="hidden text-muted-foreground xl:table-cell">{formatDateTime(e.enrolledAt)}</TableCell>
              <TableCell className="pr-5">
                <Link
                  href={href}
                  aria-label={`View ${e.student.name}`}
                  className="grid size-8 place-items-center rounded-md text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
