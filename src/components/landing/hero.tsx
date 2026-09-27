"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { RegisterCta } from "@/components/auth/register-cta";
import { MarqueeStrip } from "@/components/landing/marquee-strip";
import { RegistrationMapCard } from "@/components/landing/registration-map-card";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="relative overflow-hidden bg-white text-neutral-950">
      {/* Oversized ghost numeral — editorial background flourish */}
      <span
        aria-hidden
        className="font-serif pointer-events-none absolute -top-10 left-[-3%] hidden text-[24rem] leading-none font-light text-neutral-950/[0.025] select-none xl:block"
      >
        26
      </span>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-16 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-20">
        <div className="text-center lg:text-left">
          <motion.div {...rise(0)} className="flex justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-950/15 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] text-neutral-600 uppercase">
              National Aptitude Assessment &middot; 2026 Cohort
            </span>
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="font-serif mt-7 text-5xl leading-[1.04] font-medium tracking-tight text-balance sm:text-6xl lg:text-[3.4rem] xl:text-7xl"
          >
            Your grade isn&apos;t your ceiling.
          </motion.h1>

          <motion.p {...rise(0.16)} className="mx-auto mt-6 max-w-xl text-lg text-pretty text-neutral-500 lg:mx-0">
            One assessment, open to students in Grades 10&ndash;12. Score well, and walk away with something a
            transcript can&apos;t give you &mdash; real work experience, before you&apos;ve even left school.
          </motion.p>

          <motion.div
            {...rise(0.26)}
            className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
          >
            <RegisterCta className="group w-full sm:w-auto" size="lg" />
            <a
              href="#prizes"
              className="group inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 sm:w-auto"
            >
              See the prizes
              <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>

          <motion.p {...rise(0.34)} className="mt-8 text-xs tracking-wide text-neutral-400 uppercase">
            Free to apply &middot; Grades 10, 11 &amp; 12
          </motion.p>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        >
          <RegistrationMapCard />
        </motion.div>
      </div>

      <MarqueeStrip />
    </section>
  );
}
