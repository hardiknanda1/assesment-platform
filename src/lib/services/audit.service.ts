import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export type AuditAction =
  | "enrollment.status_updated"
  | "enrollment.exported"
  | "user.role_updated";

type Client = Prisma.TransactionClient | typeof db;

/**
 * Records an admin action. Pass the transaction client when the audit entry
 * must commit atomically with the change it describes.
 */
export async function recordAudit(
  entry: {
    actorId: string | null;
    action: AuditAction;
    entityType: string;
    entityId?: string | null;
    metadata?: Prisma.InputJsonValue;
  },
  client: Client = db,
) {
  await client.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata,
    },
  });
}
