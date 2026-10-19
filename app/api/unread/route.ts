import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { unreadCount } from "@/lib/queries";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ count: 0 });
  const count = await unreadCount(session.id);
  return NextResponse.json({ count });
}
