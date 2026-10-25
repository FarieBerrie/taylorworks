import "server-only";

import { headers } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

/**
 * Fixed-window counters kept in the database, so limits hold across restarts and across more
 * than one server. Each call counts one attempt against `key`; once `limit` attempts land in the
 * current window, it returns ok: false until the window rolls over.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const windowMs = windowSeconds * 1000;
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const rowKey = `${key}@${windowStart.getTime()}`;

  let count: number;
  try {
    const row = await prisma.rateLimit.upsert({
      where: { key: rowKey },
      create: { key: rowKey, count: 1, windowStart },
      update: { count: { increment: 1 } },
      select: { count: true },
    });
    count = row.count;
  } catch (error) {
    // Two first attempts in the same instant both tried to create the row: count this one on it
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const row = await prisma.rateLimit.update({
      where: { key: rowKey },
      data: { count: { increment: 1 } },
      select: { count: true },
    });
    count = row.count;
  }

  // Now and then, clear out windows that ended more than a day ago
  if (Math.random() < 0.02) {
    await prisma.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(now - 86_400_000) } } });
  }

  const retryAfterSeconds = Math.ceil((windowStart.getTime() + windowMs - now) / 1000);
  return { ok: count <= limit, retryAfterSeconds };
}

/** "Try again in 12 minutes." */
export function retryMessage(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

/**
 * The visitor's IP address. Render's proxy puts the real client address first in
 * X-Forwarded-For. Other client-IP headers aren't trusted, since a visitor could set them
 * themselves. Locally there's no proxy, so it falls back to "local".
 */
export async function clientIp() {
  const forwarded = (await headers()).get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "local";
}
