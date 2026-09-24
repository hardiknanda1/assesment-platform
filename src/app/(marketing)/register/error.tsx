"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function RegisterError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="We couldn't load the enrollment form" />;
}
