/**
 * Seeds exams (idempotent). Run with `npm run db:seed`.
 *
 * Optional: `SEED_DEMO_STUDENTS=50 npm run db:seed` also inserts demo
 * students/enrollments for trying out the admin panel locally. Never run
 * that against production.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ExamSchema } from "../src/lib/validations/exam";
import { formatApplicationNumber } from "../src/lib/utils/application-number";
import { GRADES } from "../src/lib/constants";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL! }),
});

const EXAMS = [
  {
    code: "FA26",
    name: "Foundation Aptitude Assessment 2026",
    description:
      "For Classes 6–10. Covers quantitative reasoning, logical reasoning and reading comprehension. 90 questions, no negative marking.",
    startTime: "2026-12-13T04:30:00.000Z",
    endTime: "2026-12-13T06:30:00.000Z",
    durationMinutes: 120,
    status: "OPEN",
  },
  {
    code: "AA26",
    name: "Advanced Aptitude Assessment 2026",
    description:
      "For Classes 11–12. Covers advanced quantitative reasoning, data interpretation and critical thinking. 100 questions.",
    startTime: "2026-12-14T04:30:00.000Z",
    endTime: "2026-12-14T07:00:00.000Z",
    durationMinutes: 150,
    status: "OPEN",
  },
] as const;

const FIRST = ["Aarav", "Diya", "Vihaan", "Ananya", "Arjun", "Isha", "Kabir", "Meera", "Rohan", "Saanvi", "Aditya", "Tara"];
const LAST = ["Sharma", "Iyer", "Patel", "Reddy", "Singh", "Nair", "Gupta", "Das", "Khan", "Joshi", "Mehta", "Rao"];
const CITIES = ["Pune", "Bengaluru", "Delhi", "Mumbai", "Chennai", "Hyderabad", "Jaipur", "Kolkata", "Lucknow", "Mohali"];
const SCHOOLS = ["Greenfield Public School", "St. Xavier's High School", "Riverdale Academy", "Sunrise International", "Modern Senior Secondary"];

async function seedExams() {
  for (const raw of EXAMS) {
    const exam = ExamSchema.parse(raw);
    await prisma.exam.upsert({
      where: { code: exam.code },
      create: exam,
      update: {
        name: exam.name,
        description: exam.description,
        startTime: exam.startTime,
        endTime: exam.endTime,
        durationMinutes: exam.durationMinutes,
      },
    });
    console.log(`✔ exam ${exam.code}`);
  }
}

async function seedDemoStudents(count: number) {
  const exams = await prisma.exam.findMany({ where: { code: { in: EXAMS.map((e) => e.code) } } });
  const statuses = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING", "WAITLISTED", "CANCELLED"] as const;

  for (let i = 0; i < count; i++) {
    const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`;
    const email = `demo.student${i + 1}@example.com`;
    const exam = exams[i % exams.length]!;
    const grade = GRADES[i % GRADES.length]!;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email },
        create: { email, clerkId: `demo_${i + 1}`, role: "STUDENT" },
        update: {},
      });
      const student = await tx.student.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          name,
          phone: `+9198${String(10000000 + i).padStart(8, "0")}`,
          school: SCHOOLS[i % SCHOOLS.length]!,
          grade,
          city: CITIES[(i * 3) % CITIES.length]!,
        },
        update: {},
      });
      const existing = await tx.enrollment.findUnique({
        where: { studentId_examId: { studentId: student.id, examId: exam.id } },
      });
      if (existing) return;
      const { applicationSeq, code } = await tx.exam.update({
        where: { id: exam.id },
        data: { applicationSeq: { increment: 1 } },
      });
      await tx.enrollment.create({
        data: {
          studentId: student.id,
          examId: exam.id,
          applicationNumber: formatApplicationNumber(code, applicationSeq),
          status: statuses[i % statuses.length],
          enrolledAt: new Date(Date.now() - (i % 14) * 24 * 60 * 60 * 1000 - i * 60_000),
        },
      });
    });
  }
  console.log(`✔ ${count} demo students`);
}

async function main() {
  await seedExams();
  const demo = Number(process.env.SEED_DEMO_STUDENTS ?? 0);
  if (demo > 0) {
    if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed demo students in production.");
    await seedDemoStudents(demo);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
