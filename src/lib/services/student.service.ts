import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { StudentInput } from "@/lib/validations";

type Client = Prisma.TransactionClient | typeof db;

/** Creates the student profile for a user, or updates it with the latest details. */
export async function upsertStudentProfile(
  userId: string,
  input: Omit<StudentInput, "email">,
  client: Client = db,
) {
  const data = {
    name: input.name,
    phone: input.phone,
    school: input.school,
    grade: input.grade,
    city: input.city,
  };
  return client.student.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function getStudentByUserId(userId: string) {
  return db.student.findUnique({ where: { userId } });
}

/**
 * Everything the student dashboard needs, in one round trip.
 */
export async function getStudentDashboard(userId: string) {
  return db.student.findUnique({
    where: { userId },
    include: {
      user: { select: { email: true } },
      enrollments: {
        orderBy: { enrolledAt: "desc" },
        include: {
          exam: {
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
              startTime: true,
              endTime: true,
              durationMinutes: true,
              status: true,
            },
          },
        },
      },
    },
  });
}

export type StudentDashboard = NonNullable<Awaited<ReturnType<typeof getStudentDashboard>>>;
