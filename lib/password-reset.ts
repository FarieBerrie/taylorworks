import "server-only";

import { createHash } from "node:crypto";

import { prisma } from "@/lib/db";

/** Reset links carry a random token; the database only keeps its hash. */
export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** The reset link's token, if it's real, unused and unexpired. */
export async function findUsableResetToken(token: string) {
  if (!token) return null;
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashResetToken(token) } });
  if (!row || row.usedAt || row.expiresAt <= new Date()) return null;
  return row;
}
