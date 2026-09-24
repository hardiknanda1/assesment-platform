import { Award, BarChart3, Brain, Globe2, ShieldCheck, Timer } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Stagger, StaggerItem } from "@/components/landing/motion";

const BENEFITS = [
  {
    icon: Brain,
    title: "Measures real aptitude",
    body: "Questions test reasoning, problem-solving and comprehension — not rote memorisation of a syllabus.",
  },
  {
    icon: BarChart3,
    title: "Detailed performance report",
    body: "See section-wise scores and percentile ranks so you know exactly where you stand and what to work on.",
  },
  {
    icon: Award,
    title: "Scholarships & recognition",
    body: "Top performers receive merit certificates and become eligible for partner scholarships and programmes.",
  },
  {
    icon: Globe2,
    title: "Take it from anywhere",
    body: "The assessment runs online in your browser. No travel to a test centre, no special software to install.",
  },
  {
    icon: Timer,
    title: "Fair, timed & auto-saved",
    body: "A server-controlled timer and automatic answer saving mean a network blip never costs you your work.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & private",
    body: "Your data is encrypted in transit and never sold. Only you and the exam team can see your application.",
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why take the assessment"
          title="Built to reveal potential, not just grades"
          description="Designed to give every student a fair chance to show how they think."
        />
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div className="group h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
