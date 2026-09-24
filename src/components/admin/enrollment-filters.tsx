"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ENROLLMENT_STATUSES, ENROLLMENT_STATUS_LABELS, GRADES } from "@/lib/constants";

type ExamOption = { id: string; code: string; name: string };

const FILTER_KEYS = ["q", "examId", "status", "grade"] as const;

/**
 * URL-driven filters. Every change updates the query string, which re-runs
 * the server component with the new filters (server-side pagination/search).
 */
export function EnrollmentFilters({ exams }: { exams: ExamOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = React.useTransition();
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");

  const update = React.useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      next.delete("page"); // any filter change returns to page 1
      const qs = next.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [pathname, router, searchParams],
  );

  // Debounced search.
  React.useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (q.trim() === current) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
  }, [q, searchParams, update]);

  const hasFilters = FILTER_KEYS.some((k) => searchParams.get(k));

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone or application no."
          className="pl-9"
          aria-label="Search enrollments"
        />
        {pending ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex">
        <NativeSelect
          aria-label="Filter by exam"
          value={searchParams.get("examId") ?? ""}
          onChange={(e) => update({ examId: e.target.value || null })}
          wrapperClassName="col-span-2 sm:col-span-1 lg:w-52"
        >
          <NativeSelectOption value="">All exams</NativeSelectOption>
          {exams.map((e) => (
            <NativeSelectOption key={e.id} value={e.id}>
              {e.code} — {e.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Filter by status"
          value={searchParams.get("status") ?? ""}
          onChange={(e) => update({ status: e.target.value || null })}
          wrapperClassName="lg:w-40"
        >
          <NativeSelectOption value="">All statuses</NativeSelectOption>
          {ENROLLMENT_STATUSES.map((s) => (
            <NativeSelectOption key={s} value={s}>
              {ENROLLMENT_STATUS_LABELS[s]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Filter by grade"
          value={searchParams.get("grade") ?? ""}
          onChange={(e) => update({ grade: e.target.value || null })}
          wrapperClassName="lg:w-36"
        >
          <NativeSelectOption value="">All grades</NativeSelectOption>
          {GRADES.map((g) => (
            <NativeSelectOption key={g} value={g}>
              Class {g}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      {hasFilters ? (
        <Button
          variant="ghost"
          onClick={() => {
            setQ("");
            update({ q: null, examId: null, status: null, grade: null });
          }}
        >
          <X /> Clear
        </Button>
      ) : null}
    </div>
  );
}
