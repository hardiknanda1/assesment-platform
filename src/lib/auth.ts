import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAdminEmails } from "@/lib/env";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { findUserByClerkId, isAdminRole, syncUser, type AuthUser } from "@/lib/services/user.service";

export type { AuthUser };

/**
 * Resolves the signed-in Clerk user to the local `users` row, creating it
 * on first sight. Memoised per request with React `cache`.
 *
 * Authorization decisions use the role stored in PostgreSQL — never a
 * client-supplied value.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await findUserByClerkId(userId);
  const adminEmails = getAdminEmails();
  if (existing && !(existing.role === "STUDENT" && adminEmails.has(existing.email))) {
    return existing;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primary =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId) ??
    clerkUser.emailAddresses[0];
  if (!primary) return null;

  const email = primary.emailAddress.toLowerCase();
  const verified = primary.verification?.status === "verified";

  return syncUser({
    clerkId: userId,
    email,
    // Only verified emails can bootstrap admin access.
    bootstrapAdmin: verified && adminEmails.has(email),
  });
});

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return !!user && isAdminRole(user.role);
}

// ─── Page / layout guards (redirect or 404) ───────────────────────────────

export async function requireUser(returnTo?: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(returnTo ? `/sign-in?redirect_url=${encodeURIComponent(returnTo)}` : "/sign-in");
  }
  return user;
}

/**
 * Guards admin pages. Non-admins get a 404 so the admin surface isn't
 * advertised. Call this in every admin page (not just the layout) because
 * layouts are not re-rendered on client-side navigation.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser("/admin");
  if (!isAdmin(user)) notFound();
  return user;
}

// ─── API guards (throw AppErrors → JSON responses) ─────────────────────────

export async function requireApiUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireApiAdmin(): Promise<AuthUser> {
  const user = await requireApiUser();
  if (!isAdmin(user)) throw new ForbiddenError();
  return user;
}
