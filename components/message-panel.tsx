"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { sendMessage, type MessageState } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatWhenShort } from "@/lib/format";

const initial: MessageState = { error: "", sent: 0 };

export function MessagePanel({
  conversationId,
  messages,
}: {
  conversationId: string;
  messages: { id: string; body: string; createdAt: string; mine: boolean; senderName: string }[];
}) {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const router = useRouter();
  const bottom = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.sent > 0 && !state.error) formRef.current?.reset();
  }, [state.sent, state.error]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = window.setInterval(tick, 4000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
    };
  }, [router]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="grid gap-4">
      <div className="grid max-h-[32rem] gap-3 overflow-y-auto rounded-xl border bg-card/70 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet. Say what you need and when.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={message.mine ? "ml-8 text-right" : "mr-8"}>
              <p className="mb-1 text-xs text-muted-foreground">
                {message.mine ? "You" : message.senderName} · {formatWhenShort(new Date(message.createdAt))}
              </p>
              <p
                className={
                  message.mine
                    ? "inline-block rounded-2xl rounded-br-md bg-primary px-3 py-2 text-left text-sm text-primary-foreground"
                    : "inline-block rounded-2xl rounded-bl-md border bg-card px-3 py-2 text-left text-sm"
                }
              >
                {message.body}
              </p>
            </div>
          ))
        )}
        <div ref={bottom} />
      </div>
      <form ref={formRef} action={action} className="grid gap-2">
        <input type="hidden" name="conversationId" value={conversationId} />
        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        <Textarea name="body" required maxLength={2000} placeholder="Write a message" className="min-h-24 bg-card" />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">New messages show up every few seconds.</p>
          <Button type="submit" disabled={pending} className="h-10">
            {pending ? "Sending…" : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
