import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ExternalLink, LayoutDashboard, Menu, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NavLink } from "@/components/shared/nav-link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/enrollments", label: "Enrollments", icon: Users, exact: false },
];

function NavItems() {
  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map(({ href, label, icon: Icon, exact }) => (
        <NavLink key={href} href={href} exact={exact}>
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo href="/admin" />
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-3">
          <div>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Manage</p>
            <NavItems />
          </div>
        </div>
        <div className="border-t p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          >
            <ExternalLink className="size-4" /> View site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-lg sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Admin</SheetTitle>
                </SheetHeader>
                <div className="px-3">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
            <Logo href="/admin" />
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">Admin panel</p>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            <UserButton />
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
