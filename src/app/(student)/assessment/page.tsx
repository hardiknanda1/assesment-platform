import type { Metadata } from "next";
import Link from "next/link";
import { LaptopMinimal, Timer, Save, Wifi } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Assessment" };

/**
 * Placeholder for the future assessment engine (sessions, timer, auto-save,
 * submission). The route, layout and auth are already in place so the
 * engine can be added here without restructuring the app.
 */
export default async function AssessmentPage() {
  await requireUser("/assessment");

  return (
    <div className="space-y-8">
      <PageHeader title="Online assessment" description="Your test will open here on exam day." />
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <LaptopMinimal className="size-6" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">The assessment hasn&apos;t started yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            When the exam window opens, a <strong>Start assessment</strong> button will appear here. Until then, make
            sure your details on the dashboard are correct.
          </p>
          <div className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
            {[
              { icon: Timer, title: "Server-timed", body: "Everyone gets exactly the same time." },
              { icon: Save, title: "Auto-saved", body: "Answers are saved as you go." },
              { icon: Wifi, title: "Resilient", body: "Reconnect and continue after a network drop." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border p-4">
                <Icon className="size-4 text-primary" />
                <p className="mt-2 text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
