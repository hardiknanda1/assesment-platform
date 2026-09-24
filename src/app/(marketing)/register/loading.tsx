import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16" aria-busy="true" aria-label="Loading">
      <Skeleton className="mx-auto h-10 w-2/3" />
      <Skeleton className="mx-auto mt-3 h-5 w-1/2" />
      <div className="mt-8 space-y-6 rounded-xl border p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
