/**
 * Brand + marketing configuration. Rename the product here.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "EduAssess",
  tagline: "Aptitude assessments for ambitious students",
  description:
    "Register for national-level aptitude assessments, track your application, and take your test online — all in one place.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
  timeZone: process.env.NEXT_PUBLIC_APP_TIMEZONE ?? "Asia/Kolkata",
} as const;
