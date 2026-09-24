"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shared body for route-level `error.tsx` boundaries. */
export function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  homeHref = "/",
  homeLabel = "Go home",
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  homeHref?: string;
  homeLabel?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        An unexpected error occurred. Please try again — if it keeps happening, contact support.
        {error.digest ? <span className="mt-2 block font-mono text-xs">Reference: {error.digest}</span> : null}
      </p>
      <div className="mt-6 flex gap-2">
        {reset ? (
          <Button onClick={reset}>
            <RotateCcw /> Try again
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
