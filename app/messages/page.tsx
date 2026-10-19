import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { Container, Notice, PageHeading, PageSkeleton } from "@/components/shell";
import { getSession } from "@/lib/auth";
import { partyName, formatWhenShort } from "@/lib/format";
import { listConversations } from "@/lib/queries";

export const metadata = { title: "Messages" };
export const instant = false;

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Inbox />
    </Suspense>
  );
}

async function Inbox() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/messages");
  const conversations = await listConversations(session.id);

  return (
    <Container className="max-w-3xl">
      <PageHeading
        eyebrow="Inbox"
        title="Messages"
        description="One thread per contractor, business, and job. Open a profile or a job request to start another."
      />
      {conversations.length === 0 ? (
        <Notice>
          No conversations yet.{" "}
          <Link href="/contractors" className="font-medium underline">
            Find a contractor
          </Link>{" "}
          or{" "}
          <Link href="/jobs" className="font-medium underline">
            open the job board
          </Link>
          .
        </Notice>
      ) : (
        <ul className="grid gap-3">
          {conversations.map((conversation) => {
            const other = session.id === conversation.contractorId ? conversation.customer : conversation.contractor;
            const preview = conversation.messages[0];
            return (
              <li key={conversation.id}>
                <Link
                  href={`/messages/${conversation.id}`}
                  className="block rounded-2xl border bg-card px-4 py-3 hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">
                      {partyName(other)}
                      {conversation.unread > 0 ? (
                        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-clay px-1.5 text-[11px] font-semibold text-white">
                          {conversation.unread}
                        </span>
                      ) : null}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {preview ? formatWhenShort(preview.createdAt) : formatWhenShort(conversation.createdAt)}
                    </span>
                  </div>
                  {conversation.jobRequest ? (
                    <p className="mt-1 text-xs text-muted-foreground">About: {conversation.jobRequest.title}</p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">Direct message</p>
                  )}
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {preview?.body ?? "No messages yet."}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
