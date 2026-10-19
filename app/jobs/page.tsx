import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { JobCard } from "@/components/job-card";
import { Container, Notice, PageHeading, PageSkeleton, fieldClass } from "@/components/shell";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { isTradeSlug, trades } from "@/lib/config";
import { firstParam } from "@/lib/format";
import { prisma } from "@/lib/db";
import { listJobs } from "@/lib/queries";
import { cn } from "cn";

export const metadata = { title: "Job board" };
export const instant = false;

export default function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <JobsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function JobsContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const [params, session] = await Promise.all([searchParams, getSession()]);
  const trade = firstParam(params.trade);
  const safeTrade = isTradeSlug(trade) ? trade : "";
  const scope = firstParam(params.scope);
  const matching = session?.role === "CONTRACTOR" && scope !== "all";

  let tradeFilter: string[] | undefined;
  if (matching && session) {
    const profile = await prisma.contractorProfile.findUnique({
      where: { userId: session.id },
      include: { trades: true },
    });
    tradeFilter = profile?.trades.map((item) => item.trade) ?? [];
  }

  const jobs =
    matching && tradeFilter && tradeFilter.length === 0
      ? []
      : await listJobs({
          status: "OPEN",
          trade: safeTrade || undefined,
          trades: matching && !safeTrade ? tradeFilter : undefined,
        });

  return (
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeading
          eyebrow="Open work"
          title="Job board"
          description={
            matching
              ? "Showing open requests that match your trades."
              : "Businesses in Abilene and nearby towns post work here."
          }
        />
        {session?.role === "CUSTOMER" ? (
          <Link href="/jobs/new" className={cn(buttonVariants(), "mb-6 inline-flex h-10 px-4")}>
            Post a job
          </Link>
        ) : null}
      </div>
      <form className="mb-4 flex flex-wrap items-end gap-3" action="/jobs">
        {session?.role === "CONTRACTOR" ? (
          <input type="hidden" name="scope" value={matching ? "matching" : "all"} />
        ) : null}
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Trade</span>
          <select name="trade" defaultValue={safeTrade} className={fieldClass}>
            <option value="">All trades</option>
            {trades.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={cn(buttonVariants({ variant: "outline" }), "h-10 bg-card px-4")}>
          Filter
        </button>
        {session?.role === "CONTRACTOR" ? (
          matching ? (
            <Link href="/jobs?scope=all" className="text-sm text-primary hover:underline">
              Show every open job
            </Link>
          ) : (
            <Link href="/jobs?scope=matching" className="text-sm text-primary hover:underline">
              Only my trades
            </Link>
          )
        ) : null}
      </form>
      {matching && tradeFilter?.length === 0 ? (
        <Notice tone="warn">
          Add your trades on your{" "}
          <Link href="/profile" className="font-medium underline">
            profile
          </Link>{" "}
          to see matching jobs.
        </Notice>
      ) : jobs.length === 0 ? (
        <Notice>No open jobs match that filter.</Notice>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </Container>
  );
}
