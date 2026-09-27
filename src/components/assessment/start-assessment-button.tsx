import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AssessmentAvailability } from "@/lib/services/assessment.service";
import { formatDateTime } from "@/lib/utils";

const DISABLED_LABEL: Record<Exclude<AssessmentAvailability["state"], "live">, string> = {
  upcoming: "Not yet available",
  unscheduled: "Date to be announced",
  ended: "Assessment closed",
  ineligible: "Enrollment not confirmed",
};

export function assessmentHint(availability: AssessmentAvailability): string {
  switch (availability.state) {
    case "live":
      return availability.endsAt
        ? `The assessment is live. It closes at ${formatDateTime(availability.endsAt)}.`
        : "The assessment is live.";
    case "upcoming":
      return `The Start button unlocks at ${formatDateTime(availability.startsAt)}.`;
    case "unscheduled":
      return "The exam date hasn't been announced yet.";
    case "ended":
      return "The assessment window has closed.";
    case "ineligible":
      return "Your enrollment must be confirmed before you can take the assessment.";
  }
}

/** Opens the exam room (`/exam/[applicationNumber]`) once the window is live. */
export function StartAssessmentButton({
  applicationNumber,
  availability,
  size,
}: {
  applicationNumber: string;
  availability: AssessmentAvailability;
  size?: "default" | "lg";
}) {
  if (availability.state !== "live") {
    return (
      <Button variant="secondary" size={size} disabled>
        {DISABLED_LABEL[availability.state]}
      </Button>
    );
  }
  return (
    <Button asChild size={size}>
      <Link href={`/exam/${encodeURIComponent(applicationNumber)}`}>
        Start assessment <ArrowRight />
      </Link>
    </Button>
  );
}
