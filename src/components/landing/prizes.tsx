"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, HandHeart, Sparkles } from "lucide-react";
import { PRIZES } from "@/lib/data/registration-stats";

const ICONS = { "01": Briefcase, "02": HandHeart, "03": Sparkles } as const;

export function Prizes() {
  const reduce = useReducedMotion();

  return (
    <section id="prizes" className="scroll-mt-16 border-t border-neutral-950/10 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.14em] text-neutral-500 uppercase">For the top three scorers</p>
          <h2 className="font-serif mt-4 text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
            Rewards worth working for.
          </h2>
          <p className="mt-4 text-base text-neutral-500">
            No lucky draws, no participation trophies. Three places, decided by how you perform.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PRIZES.map((prize, i) => {
            const Icon = ICONS[prize.rank];
            return (
              <motion.div
                key={prize.rank}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                whileHover={reduce ? undefined : { y: -6 }}
                className="group relative flex flex-col rounded-2xl border border-neutral-950/10 bg-white p-8 transition-[border-color,box-shadow] duration-300 hover:border-neutral-950/30 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-5xl font-light text-neutral-200 transition-colors duration-300 group-hover:text-neutral-950">
                    {prize.rank}
                  </span>
                  <span className="grid size-11 place-items-center rounded-full border border-neutral-950/10 text-neutral-700 transition-colors duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
                    <Icon className="size-4.5" />
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-semibold tracking-tight text-neutral-950">{prize.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">{prize.description}</p>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-neutral-400">
          Winners are decided purely by exam performance. Full prize terms are announced with results.
        </p>
      </div>
    </section>
  );
}
