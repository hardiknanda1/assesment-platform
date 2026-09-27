"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { CITY_HOTSPOTS, INDIA_DOTS, STATES_REPRESENTED, TOTAL_REGISTRATIONS } from "@/lib/data/registration-stats";

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = React.useState(0);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (!active || reduce) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, reduce]);

  // Under reduced motion (or before the animation kicks in) show the final value directly.
  return active && reduce ? target : value;
}

export function RegistrationMap() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const total = useCountUp(TOTAL_REGISTRATIONS, inView);
  const [activeCity, setActiveCity] = React.useState<string | null>(null);

  return (
    <section ref={sectionRef} className="border-t border-white/10 bg-neutral-950 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
          {/* Stats column */}
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-white/50 uppercase">Where applicants are from</p>
            <h2 className="font-serif mt-4 text-4xl font-medium tracking-tight sm:text-5xl">
              Students from across India are already in.
            </h2>
            <p className="mt-4 max-w-md text-base text-white/55">
              Every state, every board. Once you register, your application number places you right alongside them.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
              <div>
                <p className="font-serif text-5xl font-medium tabular-nums">{total}+</p>
                <p className="mt-1.5 text-xs tracking-wide text-white/45 uppercase">Registrations so far</p>
              </div>
              <div>
                <p className="font-serif text-5xl font-medium tabular-nums">{STATES_REPRESENTED}+</p>
                <p className="mt-1.5 text-xs tracking-wide text-white/45 uppercase">States represented</p>
              </div>
            </div>
          </div>

          {/* Map column */}
          <div className="relative">
            <svg
              viewBox="0 0 100 100"
              role="img"
              aria-label="Map of India with markers showing where students have registered from"
              className="w-full overflow-visible"
            >
              {INDIA_DOTS.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={0.55} className="fill-white/15" />
              ))}

              {CITY_HOTSPOTS.map((hotspot) => {
                const isActive = activeCity === hotspot.city;
                const size = 0.9 + (hotspot.count / TOTAL_REGISTRATIONS) * 10;
                return (
                  <g key={hotspot.city}>
                    <circle
                      cx={hotspot.x}
                      cy={hotspot.y}
                      r={size + 2.2}
                      className={cn("fill-white/10 transition-opacity", isActive ? "opacity-100" : "opacity-0")}
                    />
                    <circle cx={hotspot.x} cy={hotspot.y} r={size} className="fill-white">
                      <animate attributeName="opacity" values="0.55;1;0.55" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                    {/* Larger invisible hit target so this works as a real 44px-ish tap target, not just the visual dot. */}
                    <circle
                      cx={hotspot.x}
                      cy={hotspot.y}
                      r={4.5}
                      fill="transparent"
                      className="cursor-pointer focus:outline-none"
                      tabIndex={0}
                      role="button"
                      aria-label={`${hotspot.city}, ${hotspot.state}: ${hotspot.count} students registered`}
                      onMouseEnter={() => setActiveCity(hotspot.city)}
                      onMouseLeave={() => setActiveCity((c) => (c === hotspot.city ? null : c))}
                      onFocus={() => setActiveCity(hotspot.city)}
                      onBlur={() => setActiveCity((c) => (c === hotspot.city ? null : c))}
                      onClick={() => setActiveCity((c) => (c === hotspot.city ? null : hotspot.city))}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            <div className="pointer-events-none absolute inset-0">
              {CITY_HOTSPOTS.map((hotspot) => (
                <motion.div
                  key={hotspot.city}
                  initial={false}
                  animate={{ opacity: activeCity === hotspot.city ? 1 : 0, y: activeCity === hotspot.city ? 0 : 4 }}
                  transition={{ duration: 0.15 }}
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border border-white/15 bg-neutral-900 px-3 py-2 text-xs whitespace-nowrap shadow-xl"
                >
                  <p className="flex items-center gap-1.5 font-medium text-white">
                    <MapPin className="size-3 text-white/60" />
                    {hotspot.city}
                  </p>
                  <p className="mt-0.5 text-white/50">{hotspot.count} students registered</p>
                </motion.div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-white/35">
              Tap or hover a marker for city-wise numbers &middot; illustrative snapshot, updated periodically
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
