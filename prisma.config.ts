import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration.
 *
 * - `DIRECT_URL` (non-pooled) is preferred for migrations. On Neon, use the
 *   direct connection string here and the pooled one for `DATABASE_URL`.
 * - Falls back to `DATABASE_URL` for local development.
 * - `prisma generate` does not need a database, so an empty URL is allowed
 *   (e.g. during `npm install` on CI before env vars are present).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
