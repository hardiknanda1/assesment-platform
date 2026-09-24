import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Network-edge gate: every non-public route requires a Clerk session.
 *
 * Role checks (ADMIN / SUPER_ADMIN) are enforced on the server against the
 * role stored in PostgreSQL — in `requireAdmin()` for every /admin page and
 * `requireApiAdmin()` for every admin API route — not only here.
 */
const isProtectedPage = createRouteMatcher(["/dashboard(.*)", "/assessment(.*)", "/register(.*)", "/admin(.*)"]);

const isProtectedApi = createRouteMatcher(["/api/enrollments(.*)", "/api/students(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedApi(req)) {
    // API clients get a JSON 401 instead of a sign-in redirect.
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be signed in." } },
        { status: 401 },
      );
    }
    return;
  }
  if (isProtectedPage(req)) {
    await auth.protect(); // redirects to /sign-in?redirect_url=…
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
