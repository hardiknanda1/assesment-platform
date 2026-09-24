import "server-only";
import { db } from "@/lib/db";
import type { User, UserRole } from "@/generated/prisma/client";
import { ADMIN_ROLES } from "@/lib/constants";

export type AuthUser = Pick<User, "id" | "clerkId" | "email" | "role">;

const authUserSelect = { id: true, clerkId: true, email: true, role: true } as const;

export function isAdminRole(role: UserRole): boolean {
  return (ADMIN_ROLES as readonly UserRole[]).includes(role);
}

export async function findUserByClerkId(clerkId: string): Promise<AuthUser | null> {
  return db.user.findUnique({ where: { clerkId }, select: authUserSelect });
}

/**
 * Creates or reconciles the local user row for a Clerk identity.
 *
 * - New users get STUDENT, or ADMIN when their email is in the bootstrap list.
 * - If the email already exists under a different Clerk id (account deleted
 *   and re-created in Clerk), the row is re-linked instead of duplicated.
 * - Existing roles are never downgraded automatically.
 */
export async function syncUser(params: {
  clerkId: string;
  email: string;
  bootstrapAdmin: boolean;
}): Promise<AuthUser> {
  const email = params.email.trim().toLowerCase();

  const existing = await db.user.findFirst({
    where: { OR: [{ clerkId: params.clerkId }, { email }] },
    select: authUserSelect,
  });

  if (!existing) {
    return db.user.upsert({
      where: { clerkId: params.clerkId },
      create: {
        clerkId: params.clerkId,
        email,
        role: params.bootstrapAdmin ? "ADMIN" : "STUDENT",
      },
      update: {},
      select: authUserSelect,
    });
  }

  const needsPromotion = params.bootstrapAdmin && existing.role === "STUDENT";
  if (existing.clerkId === params.clerkId && existing.email === email && !needsPromotion) {
    return existing;
  }

  return db.user.update({
    where: { id: existing.id },
    data: {
      clerkId: params.clerkId,
      email,
      ...(needsPromotion ? { role: "ADMIN" as const } : {}),
    },
    select: authUserSelect,
  });
}

export async function setUserRoleByEmail(email: string, role: UserRole) {
  return db.user.update({
    where: { email: email.trim().toLowerCase() },
    data: { role },
    select: authUserSelect,
  });
}
