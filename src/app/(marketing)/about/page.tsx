import type { Metadata } from "next";
import { Compass, Scale, Zap } from "lucide-react";
import { RegisterCta } from "@/components/auth/register-cta";

export const metadata: Metadata = {
  title: "About",
  description: "Why we built a national aptitude assessment for students in Grades 10–12.",
};

const BELIEFS = [
  {
    icon: Scale,
    title: "Merit over marks",
    body: "A board exam measures recall under a syllabus. This measures how you think when the syllabus runs out. Different skill, and one that matters just as much.",
  },
  {
    icon: Compass,
    title: "Exposure over exams",
    body: "The best thing school rarely gives you is a taste of real work. Our top scorers get exactly that — an internship, not just a rank.",
  },
  {
    icon: Zap,
    title: "Momentum over milestones",
    body: "Class 10th and 12th are checkpoints your school has to mark. They were never meant to be the finish line for what you go on to do.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-neutral-950/10 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-medium tracking-[0.14em] text-neutral-500 uppercase">Our philosophy</p>
          <h1 className="font-serif mt-5 text-4xl leading-[1.08] font-medium tracking-tight text-neutral-950 sm:text-6xl">
            Class 10th and 12th were never meant to be the finish line.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg text-neutral-500">
            We built this assessment for one reason: to give students still in school a real, honest measure of
            where they stand &mdash; and a real reason to look past the boards.
          </p>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
              Why we exist
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-neutral-500">
              <p>
                Most of what decides a student&apos;s next few years happens in Grade 10 or 12 &mdash; and most of it
                is measured by one thing: a board exam score. That score says a lot about memory and discipline. It
                says very little about whether you can reason through an unfamiliar problem, work under a real
                deadline, or hold your own in a room of adults.
              </p>
              <p>
                We think students deserve a second measurement &mdash; one that&apos;s national, comparable, and
                actually leads somewhere. So we built an aptitude assessment open to every student in Grades 10, 11
                and 12, regardless of board or city, and attached real stakes to it: the top scorer gets a paid
                internship, the runner-up an unpaid one, and third place a Claude subscription to keep building with.
              </p>
              <p className="font-medium text-neutral-950">
                Not because a test result should define you &mdash; but because &ldquo;work-ready&rdquo; is a skill,
                and the earlier you start practicing it, the further it takes you.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-neutral-950/10 bg-neutral-950/10 sm:grid-cols-3">
            {BELIEFS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-4 bg-white p-8">
                <span className="grid size-10 place-items-center rounded-full border border-neutral-950/10 text-neutral-700">
                  <Icon className="size-4.5" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-950/10 bg-neutral-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">Ready to find out where you stand?</h2>
          <p className="mt-4 text-white/55">Registration takes two minutes. The test takes two hours. The rest is up to you.</p>
          <div className="mt-8 flex justify-center">
            <RegisterCta size="lg" variant="mono-invert" />
          </div>
        </div>
      </section>
    </>
  );
}
