import { Clock3, GraduationCap, Laptop, Wallet } from "lucide-react";
import { RegisterCta } from "@/components/auth/register-cta";

const FACTS = [
  { icon: GraduationCap, label: "Eligibility", value: "Grades 10, 11 and 12" },
  { icon: Laptop, label: "Format", value: "Online, from anywhere" },
  { icon: Clock3, label: "Duration", value: "2 hours" },
  { icon: Wallet, label: "Fee", value: "Free to apply" },
];

export function AboutExam() {
  return (
    <section className="border-t border-neutral-950/10 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-neutral-500 uppercase">What this actually is</p>
            <h2 className="font-serif mt-4 text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
              A single test. A real head start.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-neutral-500">
              <p>
                This is a national-level aptitude assessment for students still in school &mdash; testing how you
                think, not just what you&apos;ve memorized for a board exam.
              </p>
              <p>
                Class 10th and 12th mark the end of a syllabus, not the end of what you&apos;re capable of. We built
                this so students can find that out earlier: register, sit a two-hour test online, and see exactly
                where you stand against people your age, nationally.
              </p>
              <p className="font-medium text-neutral-950">
                The top three don&apos;t just get a certificate. They get put to work.
              </p>
            </div>

            <div className="mt-10">
              <RegisterCta size="lg" />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-950/10 bg-neutral-950/10 sm:gap-px">
            {FACTS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-3 bg-white p-6">
                <Icon className="size-5 text-neutral-400" />
                <div>
                  <dt className="text-xs tracking-wide text-neutral-400 uppercase">{label}</dt>
                  <dd className="mt-1 text-base font-semibold text-neutral-950">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
