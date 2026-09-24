import { ClipboardList, FileCheck2, LaptopMinimal, UserPlus } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Stagger, StaggerItem } from "@/components/landing/motion";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    body: "Sign up with your email in seconds. Your account keeps your application safe.",
  },
  {
    icon: ClipboardList,
    title: "Fill the enrollment form",
    body: "Tell us your school, grade and city, and choose the assessment you want to take.",
  },
  {
    icon: FileCheck2,
    title: "Get your application number",
    body: "It's generated instantly and always available on your dashboard.",
  },
  {
    icon: LaptopMinimal,
    title: "Take the test online",
    body: "On exam day, log in and start your assessment right from your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="From sign-up to test day in four steps"
          description="No paperwork, no queues. Everything happens online."
        />
        <Stagger className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <div
            aria-hidden
            className="absolute top-6 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <StaggerItem key={title} className="relative text-center">
              <div className="relative mx-auto grid size-12 place-items-center rounded-2xl border bg-background shadow-sm">
                <Icon className="size-5 text-primary" />
                <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mx-auto mt-2 max-w-60 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
