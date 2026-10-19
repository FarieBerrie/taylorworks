import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

import { MessagePanel } from "@/components/message-panel";
import { Container, PageSkeleton } from "@/components/shell";
import { getSession } from "@/lib/auth";
import { partyName } from "@/lib/format";
import { getConversation, markConversationRead } from "@/lib/queries";
import { tradeLabel } from "@/lib/config";

export const metadata = { title: "Conversation" };
export const instant = false;

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Thread params={params} />
    </Suspense>
  );
}

async function Thread({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/messages");
  const { id } = await params;
  const conversation = await getConversation(id, session.id);
  if (!conversation) notFound();
  await markConversationRead(conversation.id, session.id);

  const other = session.id === conversation.contractorId ? conversation.customer : conversation.contractor;

  return (
    <Container className="max-w-3xl">
      <Link href="/messages" className="text-sm text-primary hover:underline">
        All messages
      </Link>
      <h1 className="mt-2 text-3xl">{partyName(other)}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {conversation.jobRequest ? (
          <>
            About{" "}
            <Link href={`/jobs/${conversation.jobRequest.id}`} className="text-primary hover:underline">
              {conversation.jobRequest.title}
            </Link>{" "}
            · {tradeLabel(conversation.jobRequest.trade)} · {conversation.jobRequest.city}
          </>
        ) : (
          "Direct message"
        )}
      </p>
      <div className="mt-6">
        <MessagePanel
          conversationId={conversation.id}
          messages={conversation.messages.map((message) => ({
            id: message.id,
            body: message.body,
            createdAt: message.createdAt.toISOString(),
            mine: message.senderId === session.id,
            senderName: message.sender.name,
          }))}
        />
      </div>
    </Container>
  );
}
