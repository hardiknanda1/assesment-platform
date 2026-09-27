const ITEMS = [
  "Paid internship",
  "Unpaid internship",
  "Claude subscription",
  "Open to Grades 10–12",
  "Free to register",
];

/**
 * Continuous ticker band. Purely decorative/teaser — reinforces the prizes
 * and eligibility before the visitor reaches those sections. Pauses on
 * hover and under prefers-reduced-motion (see .marquee-track in globals.css).
 */
export function MarqueeStrip() {
  const row = (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center gap-6">
          <span className="text-sm font-medium tracking-wide whitespace-nowrap text-white uppercase">{item}</span>
          <span aria-hidden className="size-1 rounded-full bg-white/40" />
        </span>
      ))}
    </>
  );

  return (
    <div className="overflow-hidden border-y border-white/10 bg-neutral-950 py-3.5" aria-hidden="true">
      <div className="marquee-track flex w-max gap-6">
        {row}
        {row}
      </div>
    </div>
  );
}
