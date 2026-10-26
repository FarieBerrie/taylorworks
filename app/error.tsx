"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shell";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="max-w-xl py-16">
      <h1 className="text-3xl">Something stalled.</h1>
      <p className="mt-2 text-muted-foreground">Try the page again. If it keeps failing, refresh and sign in once more.</p>
      <Button type="button" onClick={() => retry()} className="mt-6 h-10">
        Try again
      </Button>
    </Container>
  );
}
