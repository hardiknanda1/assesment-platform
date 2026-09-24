import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/shared/nav-link";

export function StudentHeader({ showAdminLink }: { showAdminLink: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo href="/dashboard" />
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Student">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/assessment">Assessment</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {showAdminLink ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ShieldCheck /> Admin
              </Link>
            </Button>
          ) : null}
          <UserButton />
        </div>
      </div>
      <nav className="flex gap-1 border-t px-4 py-1.5 sm:hidden" aria-label="Student mobile">
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/assessment">Assessment</NavLink>
      </nav>
    </header>
  );
}
