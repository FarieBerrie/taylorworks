import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { JobCard } from "@/components/job-card";
import { Container, Notice, PageHeading, PageSkeleton } from "@/components/shell";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { planByTier, site } from "@/lib/config";
import { prisma } from "@/lib/db";
import { listingStatusLabel, isListingPublic } from "@/lib/listing";
import { formatWhen } from "@/lib/format";
import { listJobs, unreadCount } from "@/lib/queries";
import { cn } from "cn";

export const metadata = { title: "Dashboard" };
export const instant = false;

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  const now = new Date();
  const unread = await unreadCount(session.id);

  if (session.role === "CUSTOMER") {
    const [profile, jobs] = await Promise.all([
      prisma.customerProfile.findUnique({ where: { userId: session.id } }),
      listJobs({ customerId: session.id }),
    ]);
    return (
      <Container>
        <PageHeading
          eyebrow={site.name}
          title={profile?.businessName ?? session.name}
          description="Post work, then answer contractors from your inbox."
        />
        <div className="mb-6 flex flex-wrap gap-3">
          <Link href="/jobs/new" className={cn(buttonVariants(), "inline-flex h-10 px-4")}>
            Post a job
          </Link>
          <Link href="/contractors" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 bg-card px-4")}>
            Find contractors
          </Link>
          <Link href="/messages" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 bg-card px-4")}>
            Messages{unread > 0 ? ` (${unread})` : ""}
          </Link>
        </div>
        <h2 className="mb-3 text-2xl">Your requests</h2>
        {jobs.length === 0 ? (
          <Notice>You have not posted a job yet.</Notice>
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

  const profile = await prisma.contractorProfile.findUnique({
    where: { userId: session.id },
    include: { listing: true, trades: true },
  });
  const listed = isListingPublic(profile?.listing, now);
  const tradeSlugs = profile?.trades.map((trade) => trade.trade) ?? [];
  const visibleJobs = tradeSlugs.length ? await listJobs({ status: "OPEN", trades: tradeSlugs }) : [];

  return (
    <Container>
      <PageHeading
        eyebrow="Contractor"
        title={profile?.businessName ?? session.name}
        description="Your listing controls whether businesses can find you. Job messages work either way."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Listing</p>
          <p className="mt-1 font-heading text-2xl">{listingStatusLabel(profile?.listing, now)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {listed
              ? `${planByTier(profile?.listing?.tier ?? "BASIC").name} plan${
                  profile?.listing?.currentPeriodEnd
                    ? `, through ${formatWhen(profile.listing.currentPeriodEnd)}`
                    : ""
                }.`
              : "You are not in the public directory."}
          </p>
          <Link href="/billing" className={cn(buttonVariants(), "mt-4 inline-flex h-10 px-4")}>
            Manage listing
          </Link>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Inbox</p>
          <p className="mt-1 font-heading text-2xl">{unread === 0 ? "Caught up" : `${unread} unread`}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.description ? "Profile is ready to show." : "Add a description so the card says what you do."}
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/messages" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 bg-card px-4")}>
              Open messages
            </Link>
            <Link href="/profile" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 bg-card px-4")}>
              Edit profile
            </Link>
          </div>
        </div>
      </div>
      {!listed ? (
        <div className="mb-6">
          <Notice tone="warn">Businesses cannot find this profile in search until the listing is active.</Notice>
        </div>
      ) : null}
      <h2 className="mb-3 text-2xl">Open jobs in your trades</h2>
      {visibleJobs.length === 0 ? (
        <Notice>Nothing open matches your trades right now.</Notice>
      ) : (
        <div className="grid gap-4">
          {visibleJobs.slice(0, 5).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </Container>
  );
}
