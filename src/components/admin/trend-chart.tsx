import { formatNumber } from "@/lib/utils";

/**
 * Minimal daily-enrollments column chart (pure CSS, no chart library).
 * Each column has an accessible label; the table fallback is sr-only.
 */
export function TrendChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);
  const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
  const label = (day: string) => fmt.format(new Date(`${day}T00:00:00Z`));

  return (
    <div>
      <div className="flex h-40 items-end gap-1.5" role="img" aria-label={`${total} enrollments in the last ${data.length} days`}>
        {data.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-[4px] bg-primary/80 transition-colors group-hover:bg-primary"
              style={{ height: `${Math.max(d.count ? 4 : 1.5, (d.count / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              <span className="font-medium">{formatNumber(d.count)}</span> · {label(d.day)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{data[0] ? label(data[0].day) : ""}</span>
        <span>{data.at(-1) ? label(data.at(-1)!.day) : ""}</span>
      </div>
      <table className="sr-only">
        <caption>Daily enrollments</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
