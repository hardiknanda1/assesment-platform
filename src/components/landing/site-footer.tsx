import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/#prizes", label: "Prizes" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Students",
    links: [
      { href: "/sign-up", label: "Create account" },
      { href: "/sign-in", label: "Log in" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        {/* Editorial masthead line */}
        <div className="flex flex-col gap-8 border-b border-white/10 pb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md space-y-4">
            <Logo mono />
            <p className="font-serif text-2xl leading-snug tracking-tight text-white/90 italic">
              &ldquo;Your grade is a checkpoint. Not a ceiling.&rdquo;
            </p>
          </div>

          {/* The two required destinations, as explicit buttons */}
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="mono-outline" className="group">
              <Link href="/about">
                About us
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="mono-invert" className="group">
              <Link href="/contact">
                Contact us
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(2,1fr)]">
          <div className="space-y-3">
            <p className="max-w-xs text-sm text-white/50">{siteConfig.description}</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium tracking-widest text-white/40 uppercase">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-white/40 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>
            Questions?{" "}
            <a href={`mailto:${siteConfig.supportEmail}`} className="underline underline-offset-4 hover:text-white">
              {siteConfig.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
