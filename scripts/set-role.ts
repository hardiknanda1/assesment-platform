/**
 * Grant or change a user's role.
 *
 *   npm run user:role -- someone@school.org ADMIN
 *
 * The user must have signed in at least once (so their row exists).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const ROLES = ["STUDENT", "ADMIN", "SUPER_ADMIN"] as const;
type Role = (typeof ROLES)[number];

async function main() {
  const [email, role = "ADMIN"] = process.argv.slice(2);
  if (!email || !ROLES.includes(role as Role)) {
    console.error(`Usage: npm run user:role -- <email> <${ROLES.join("|")}>`);
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL! }),
  });
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      console.error(`No user with email ${email}. Ask them to sign in once first.`);
      process.exit(1);
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { role: role as Role } }),
      prisma.auditLog.create({
        data: {
          actorId: null,
          action: "user.role_updated",
          entityType: "user",
          entityId: user.id,
          metadata: { from: user.role, to: role, via: "cli" },
        },
      }),
    ]);
    console.log(`✔ ${email}: ${user.role} → ${role}`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
