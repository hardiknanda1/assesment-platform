import { FadeIn } from "@/components/landing/motion";
import { RegisterCta } from "@/components/auth/register-cta";

export function CtaSection() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <FadeIn className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-brand-2/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Your seat for the 2026 assessment is waiting.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Register today — it takes less than two minutes and you&apos;ll get your application number instantly.
          </p>
          <div className="mt-8 flex justify-center">
            <RegisterCta variant="secondary" label="Start your registration" className="group" />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
