import { connection } from "next/server";

import { prisma } from "@/lib/db";

/**
 * Render's health check (render.yaml healthCheckPath). A new deploy only takes traffic once this
 * answers 200, which needs the server up and the database reachable.
 */
export async function GET() {
  await connection();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[health] Database check failed:", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
