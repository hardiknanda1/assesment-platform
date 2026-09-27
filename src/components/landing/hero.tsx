"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { RegisterCta } from "@/components/auth/register-cta";
import { MarqueeStrip } from "@/components/landing/marquee-strip";
import { TOTAL_REGISTRATIONS } from "@/lib/data/registration-stats";

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
      {/* Oversized ghost numeral — editorial background flourish, not decorative-but-loud */}
      <span
        aria-hidden
        className="font-serif pointer-events-none absolute -top-10 right-[-4%] hidden text-[26rem] leading-none font-light text-neutral-950/[0.03] select-none sm:block"
      >
        26
      </span>

      <div className="mx-auto max-w-4xl px-4 pt-20 pb-16 text-center sm:px-6 md:pt-28 md:pb-20">
        <motion.div {...rise(0)} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-950/15 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] text-neutral-600 uppercase">
            National Aptitude Assessment &middot; 2026 Cohort
          </span>
        </motion.div>

        <motion.h1
          {...rise(0.08)}
          className="font-serif mt-8 text-5xl leading-[1.04] font-medium tracking-tight text-balance sm:text-6xl md:text-7xl"
        >
          Your grade isn&apos;t your ceiling.
        </motion.h1>

        <motion.p
          {...rise(0.16)}
          className="mx-auto mt-7 max-w-xl text-lg text-pretty text-neutral-500"
        >
          One assessment, open to students in Grades 10&ndash;12. Score well, and walk away with something a
          transcript can&apos;t give you &mdash; real work experience, before you&apos;ve even left school.
        </motion.p>

        <motion.div
          {...rise(0.26)}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <RegisterCta className="group w-full sm:w-auto" size="lg" />
          <Link
            href="#prizes"
            className="group inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 sm:w-auto"
          >
            See the prizes
            <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" />
          </Link>
        </motion.div>

        <motion.p {...rise(0.34)} className="mt-8 text-xs tracking-wide text-neutral-400 uppercase">
          {TOTAL_REGISTRATIONS}+ students already registered &middot; Free to apply
        </motion.p>
      </div>

      <MarqueeStrip />
    </section>
  );
}
