import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_SIZES } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";

function hrefFor(base: string, params: Record<string, string>, patch: Record<string, string | number>) {
  const next = new URLSearchParams(params);
  for (const [k, v] of Object.entries(patch)) next.set(k, String(v));
  if (next.get("page") === "1") next.delete("page");
  return `${base}?${next.toString()}`;
}

/** Server-rendered pagination driven entirely by the URL. */
export function Pagination({
  basePath,
  params,
  page,
  pageCount,
  limit,
  total,
}: {
  basePath: string;
  params: Record<string, string>;
  page: number;
  pageCount: number;
  limit: number;
  total: number;
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
      <p className="text-muted-foreground">
        Showing <span className="font-medium text-foreground">{formatNumber(from)}</span>–
        <span className="font-medium text-foreground">{formatNumber(to)}</span> of{" "}
        <span className="font-medium text-foreground">{formatNumber(total)}</span>
      </p>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1 sm:flex" aria-label="Rows per page">
          <span className="mr-1 text-muted-foreground">Rows</span>
          {PAGE_SIZES.map((size) => (
            <Link
              key={size}
              href={hrefFor(basePath, params, { limit: size, page: 1 })}
              className={cn(
                "rounded-md px-2 py-1 tabular-nums",
                size === limit ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-accent/60",
              )}
            >
              {size}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <PageButton href={page > 1 ? hrefFor(basePath, params, { page: page - 1 }) : null} label="Previous page">
            <ChevronLeft />
          </PageButton>
          <span className="px-2 tabular-nums text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <PageButton href={page < pageCount ? hrefFor(basePath, params, { page: page + 1 }) : null} label="Next page">
            <ChevronRight />
          </PageButton>
        </div>
      </div>
    </div>
  );
}

function PageButton({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  if (!href) {
    return (
      <Button variant="outline" size="icon-sm" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button asChild variant="outline" size="icon-sm">
      <Link href={href} aria-label={label} scroll={false}>
        {children}
      </Link>
    </Button>
  );
}
