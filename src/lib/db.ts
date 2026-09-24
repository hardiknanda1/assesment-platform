import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getServerEnv } from "@/lib/env";

/**
 * Single Prisma client per server instance.
 *
 * On Vercel/Neon, `DATABASE_URL` should be the *pooled* connection string
 * (PgBouncer) so hundreds of concurrent serverless invocations share a small
 * number of Postgres connections. `max` keeps each instance's pool small.
 */
function createPrismaClient() {
  const { DATABASE_URL, NODE_ENV } = getServerEnv();
  const adapter = new PrismaPg({
    connectionString: DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  });
  return new PrismaClient({
    adapter,
    log: NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientSingleton };

export const db: PrismaClientSingleton = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
