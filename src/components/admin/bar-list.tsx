import Link from "next/link";
import { formatNumber } from "@/lib/utils";

/** Horizontal bar list: label + proportional bar + value. */
export function BarList({
  items,
  emptyLabel = "No data yet",
}: {
  items: { key: string; label: React.ReactNode; value: number; href?: string }[];
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const content = (
          <>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{item.label}</span>
              <span className="font-medium tabular-nums">{formatNumber(item.value)}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(item.value ? 2 : 0, (item.value / max) * 100)}%` }}
              />
            </div>
          </>
        );
        return (
          <li key={item.key}>
            {item.href ? (
              <Link href={item.href} className="block rounded-md transition-opacity hover:opacity-80">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}
