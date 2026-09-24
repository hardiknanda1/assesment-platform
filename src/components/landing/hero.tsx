"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, CalendarClock, Clock3, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterCta } from "@/components/auth/register-cta";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_28%,transparent),transparent)] blur-2xl" />
        <div className="absolute top-40 -right-40 h-[380px] w-[380px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand-2)_30%,transparent),transparent)] blur-2xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 md:pt-24 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
        <div className="text-center lg:text-left">
          <motion.div {...rise(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Registrations for the 2026 cycle are open
            </span>
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Discover what you&apos;re <span className="text-gradient">truly capable</span> of.
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted-foreground lg:mx-0"
          >
            A rigorous, fair aptitude assessment for students in Classes 6–12. Register in two minutes, get your
            application number instantly, and take the test online from anywhere.
          </motion.p>

          <motion.div
            {...rise(0.24)}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <RegisterCta className="group w-full sm:w-auto" />
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </motion.div>

          <motion.ul
            {...rise(0.32)}
            className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start"
          >
            {["Free to register", "Instant application number", "Online, proctored test"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-success" />
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <HeroVisual reduce={!!reduce} />
      </div>
    </section>
  );
}

function HeroVisual({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
        className="relative rounded-2xl border bg-card/90 p-6 shadow-2xl shadow-primary/10 backdrop-blur"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Application</p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-tight">FA26-000124</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-xs font-medium text-success">
            <BadgeCheck className="size-3.5" /> Confirmed
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <InfoTile icon={<CalendarClock className="size-4" />} label="Exam date" value="15 Dec 2026" />
          <InfoTile icon={<Clock3 className="size-4" />} label="Duration" value="2 hr" />
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium">Preparation progress</p>
          {[
            { label: "Quantitative reasoning", v: 78 },
            { label: "Logical reasoning", v: 64 },
            { label: "Verbal ability", v: 86 },
          ].map((row, i) => (
            <div key={row.label} className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{row.label}</span>
                <span>{row.v}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-brand-2"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${row.v}%` }}
                  transition={{ duration: 1.1, delay: 0.6 + i * 0.12, ease: EASE }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
        className="absolute -bottom-6 -left-4 hidden items-center gap-3 rounded-xl border bg-card p-3 pr-4 shadow-xl sm:flex"
      >
        <span className="grid size-9 place-items-center rounded-lg bg-warning/15 text-[color-mix(in_oklch,var(--warning)_60%,black)]">
          <Trophy className="size-4" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">Top performers</p>
          <p className="text-sm font-semibold">Scholarships &amp; certificates</p>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-5 -right-3 hidden rounded-xl border bg-card px-3 py-2 text-xs shadow-lg sm:block"
      >
        <span className="font-semibold text-primary">Answers auto-saved</span> as you go
      </motion.div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
