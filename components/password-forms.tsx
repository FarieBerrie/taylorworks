"use client";

import { useActionState } from "react";

import { requestPasswordReset, resetPassword, type ForgotState, type ResetState } from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm" role="alert">
      {message}
    </p>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, { error: "", sent: false } as ForgotState);
  if (state.sent) {
    return (
      <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm" role="status">
        If that email has an account, a reset link is on its way. It expires in an hour. Check your spam folder if it
        doesn&apos;t arrive in a few minutes.
      </p>
    );
  }
  return (
    <form action={action} className="grid gap-4">
      <ErrorNote message={state.error} />
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-10 bg-card" />
      </div>
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, { error: "" } as ResetState);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <ErrorNote message={state.error} />
      <div className="grid gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          className="h-10 bg-card"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="confirm">Type it again</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          className="h-10 bg-card"
        />
      </div>
      <p className="text-sm text-muted-foreground">Saving signs you out everywhere, then you log in with the new password.</p>
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
