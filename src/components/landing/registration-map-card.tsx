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

/**
 * The India dot-map + live registration counter, as a self-contained card.
 * Deliberately high-contrast (black card on the white hero) so it reads as
 * the visual anchor of the fold, not a footnote below it.
 */
export function RegistrationMapCard({ className }: { className?: string }) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-60px" });
  const total = useCountUp(TOTAL_REGISTRATIONS, inView);
  const [activeCity, setActiveCity] = React.useState<string | null>(null);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 p-6 text-white shadow-[0_40px_80px_-32px_rgba(0,0,0,0.45)] sm:p-8",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-white/50 uppercase">Where applicants are from</p>
          <p className="mt-1 text-sm text-white/60">Live snapshot across India</p>
        </div>
        <div className="flex items-baseline gap-6">
          <div>
            <p className="font-serif text-4xl font-medium tabular-nums sm:text-5xl">{total}+</p>
            <p className="mt-1 text-[11px] tracking-wide text-white/45 uppercase">Registered</p>
          </div>
          <div>
            <p className="font-serif text-4xl font-medium tabular-nums sm:text-5xl">{STATES_REPRESENTED}+</p>
            <p className="mt-1 text-[11px] tracking-wide text-white/45 uppercase">States</p>
          </div>
        </div>
      </div>

      <div className="relative mt-6">
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label="Map of India with markers showing where students have registered from"
          className="w-full overflow-visible"
        >
          {INDIA_DOTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={0.65} className="fill-white/18" />
          ))}

          {CITY_HOTSPOTS.map((hotspot) => {
            const isActive = activeCity === hotspot.city;
            const size = 1 + (hotspot.count / TOTAL_REGISTRATIONS) * 11;
            return (
              <g key={hotspot.city}>
                <circle
                  cx={hotspot.x}
                  cy={hotspot.y}
                  r={size + 2.4}
                  className={cn("fill-white/10 transition-opacity", isActive ? "opacity-100" : "opacity-0")}
                />
                <circle cx={hotspot.x} cy={hotspot.y} r={size} className="fill-white">
                  <animate attributeName="opacity" values="0.55;1;0.55" dur="2.6s" repeatCount="indefinite" />
                </circle>
                {/* Larger invisible hit target so this works as a real tap target, not just the visual dot. */}
                <circle
                  cx={hotspot.x}
                  cy={hotspot.y}
                  r={4.8}
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
              className="absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border border-neutral-950/10 bg-white px-3 py-2 text-xs whitespace-nowrap text-neutral-950 shadow-xl"
            >
              <p className="flex items-center gap-1.5 font-medium">
                <MapPin className="size-3 text-neutral-400" />
                {hotspot.city}
              </p>
              <p className="mt-0.5 text-neutral-500">{hotspot.count} students registered</p>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-white/35">
        Tap or hover a marker for city-wise numbers &middot; illustrative snapshot, updated periodically
      </p>
    </div>
  );
}
