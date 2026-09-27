"use client";

import * as React from "react";
import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RegisterCta } from "@/components/auth/register-cta";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#prizes", label: "Prizes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-neutral-950 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo mono />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative rounded-md px-3 py-2 text-[13px] font-medium tracking-wide text-white/65 uppercase transition-colors hover:text-white"
            >
              {item.label}
              <span className="absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Show when="signed-out">
            <Button asChild variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="/sign-in">Log in</Link>
            </Button>
            <RegisterCta size="sm" label="Register" variant="mono-invert" className="group" />
          </Show>
          <Show when="signed-in">
            <Button asChild variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton />
          </Show>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-white/10 bg-neutral-950 text-white">
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {NAV.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-sm tracking-wide text-white/80 uppercase transition-colors hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                <Show when="signed-out">
                  <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                    <Link href="/sign-in">Log in</Link>
                  </Button>
                  <RegisterCta size="default" label="Register" variant="mono-invert" />
                </Show>
                <Show when="signed-in">
                  <Button asChild className="bg-white text-neutral-950 hover:bg-white/90">
                    <Link href="/dashboard">Go to dashboard</Link>
                  </Button>
                </Show>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
