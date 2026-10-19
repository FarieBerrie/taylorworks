import Link from "next/link";

import { Container } from "@/components/shell";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/config";
import { cn } from "cn";

export default function NotFound() {
  return (
    <Container className="max-w-xl py-16">
      <p className="text-xs font-medium tracking-[0.16em] text-clay uppercase">{site.name}</p>
      <h1 className="mt-2 text-3xl">That page is not on the board.</h1>
      <p className="mt-2 text-muted-foreground">
        The profile may be unlisted, or the link is out of date.
      </p>
      <Link href="/contractors" className={cn(buttonVariants(), "mt-6 inline-flex h-10 px-4")}>
        Back to the directory
      </Link>
    </Container>
  );
}
