import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

import { closeJob } from "@/app/actions/jobs";
import { startConversation } from "@/app/actions/messages";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container, PageSkeleton } from "@/components/shell";
import { getSession } from "@/lib/auth";
import { tradeLabel } from "@/lib/config";
import { formatBudget, formatWhen } from "@/lib/format";
import { getJob } from "@/lib/queries";
import { cn } from "cn";

export const instant = false;

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <JobDetail params={params} />
    </Suspense>
  );
}

async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [job, session] = await Promise.all([getJob(id), getSession()]);
  if (!job) notFound();
  const business = job.customer.customerProfile?.businessName ?? job.customer.name;
  const mine = session?.id === job.customerId;

  return (
    <Container className="max-w-3xl">
      <Link href="/jobs" className="text-sm text-primary hover:underline">
        Job board
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{tradeLabel(job.trade)}</Badge>
        {job.status === "CLOSED" ? <Badge variant="outline">Closed</Badge> : <Badge>Open</Badge>}
        <span className="text-xs text-muted-foreground">Posted {formatWhen(job.createdAt)}</span>
      </div>
      <h1 className="mt-2 text-4xl text-balance">{job.title}</h1>
      <p className="mt-2 text-muted-foreground">
        {business} · {job.city}
        {job.zip ? ` ${job.zip}` : ""} · {formatBudget(job.budgetMin, job.budgetMax)} · {job.timeline}
      </p>
      <p className="mt-6 max-w-2xl whitespace-pre-wrap leading-relaxed">{job.description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {session?.role === "CONTRACTOR" && job.status === "OPEN" ? (
          <form action={startConversation}>
            <input type="hidden" name="jobId" value={job.id} />
            <Button type="submit" className="h-10">
              Message about this job
            </Button>
          </form>
        ) : null}
        {!session ? (
          <Link href={`/login?next=/jobs/${job.id}`} className={cn(buttonVariants(), "inline-flex h-10 px-4")}>
            Log in to respond
          </Link>
        ) : null}
        {mine && job.status === "OPEN" ? (
          <form action={closeJob}>
            <input type="hidden" name="jobId" value={job.id} />
            <Button type="submit" variant="outline" className="h-10 bg-card">
              Mark filled
            </Button>
          </form>
        ) : null}
        {session?.role === "CONTRACTOR" ? (
          <Link href="/billing" className="self-center text-sm text-muted-foreground hover:underline">
            Your public profile depends on an active listing.
          </Link>
        ) : null}
      </div>
    </Container>
  );
}
