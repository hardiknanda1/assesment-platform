import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function LogoMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  // Unique per instance: a shared id breaks when the first copy is display:none.
  const gradientId = useId();
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--brand-2)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={mono ? "currentColor" : `url(#${gradientId})`} />
      <path
        d="M9 21.5 14 10l5 11.5M11 17.5h6"
        stroke={mono ? "var(--logo-mark-fg, #000)" : "white"}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="11" r="2.2" fill={mono ? "var(--logo-mark-fg, #000)" : "white"} />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  mono = false,
}: {
  className?: string;
  href?: string;
  mono?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 font-semibold tracking-tight",
        mono && "text-white [--logo-mark-fg:#000]",
        className,
      )}
    >
      <LogoMark className="size-7" mono={mono} />
      <span className="text-lg">{siteConfig.name}</span>
    </Link>
  );
}
