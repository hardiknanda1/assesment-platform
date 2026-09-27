import { UserButton } from "@clerk/nextjs";
import { LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

/**
 * Distraction-free shell for the exam room: no site navigation, so students
 * can't wander off mid-test. Auth is enforced by the proxy and the page.
 */
export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <span className="flex items-center gap-2.5 font-semibold tracking-tight">
            <LogoMark className="size-6" />
            {siteConfig.name} · Exam room
          </span>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}
