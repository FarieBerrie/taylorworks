import { connection } from "next/server";

import { HeaderBar } from "@/components/header-bar";
import { getSession } from "@/lib/auth";
import { unreadCount } from "@/lib/queries";

export async function SiteHeader() {
  await connection();
  const session = await getSession();
  const unread = session ? await unreadCount(session.id) : 0;
  return <HeaderBar user={session ? { name: session.name, role: session.role } : null} unread={unread} />;
}

export function HeaderFallback() {
  return <div className="h-16 border-b border-border/80 bg-cream/90" />;
}
