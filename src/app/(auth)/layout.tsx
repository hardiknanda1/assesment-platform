import { BadgeCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-32 -bottom-32 size-96 rounded-full bg-brand-2/40 blur-3xl" />
        </div>
        <div className="relative">
          <Logo className="text-primary-foreground" />
        </div>
        <div className="relative mt-auto max-w-md space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">One account for registration, results and your online test.</h2>
          <ul className="space-y-3 text-primary-foreground/85">
            {["Enroll in minutes", "Instant application number", "Track everything on your dashboard"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <BadgeCheck className="size-5" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="flex flex-col items-center justify-center gap-8 px-4 py-12">
        <div className="lg:hidden">
          <Logo />
        </div>
        {children}
      </main>
    </div>
  );
}
