"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Primary call-to-action. Signed-out visitors go to sign-up (which then
 * lands on /register); signed-in users go straight to the enrollment form.
 * Client-side so the landing page stays statically rendered.
 */
export function RegisterCta({
  label = "Register now",
  size = "lg",
  variant = "mono",
  className,
}: {
  label?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary" | "mono" | "mono-invert" | "mono-outline";
  className?: string;
}) {
  const { isSignedIn } = useAuth();
  return (
    <Button asChild size={size} variant={variant} className={className}>
      <Link href={isSignedIn ? "/register" : "/sign-up"}>
        {label}
        <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}
