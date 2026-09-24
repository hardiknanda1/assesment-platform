import { requireUser, isAdmin } from "@/lib/auth";
import { StudentHeader } from "@/components/student/student-header";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  return (
    <>
      <StudentHeader showAdminLink={isAdmin(user)} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}
