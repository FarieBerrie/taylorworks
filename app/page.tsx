import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { ContractorCard } from "@/components/contractor-card";
import { JobCard } from "@/components/job-card";
import { SearchForm } from "@/components/search-form";
import { Container } from "@/components/shell";
import { Skyline } from "@/components/skyline";
import { buttonVariants } from "@/components/ui/button";
import { listingPlans, site } from "@/lib/config";
import { listJobs, searchContractors } from "@/lib/queries";
import { cn } from "cn";

export const instant = false;

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden border-b border-border/70">
        <div className="relative">
          <Skyline />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        <Container className="relative -mt-16 pb-10 sm:-mt-24">
          <p className="text-xs font-medium tracking-[0.16em] text-clay uppercase">
            {site.city} and the {site.region}
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl leading-tight text-balance sm:text-5xl">{site.tagline}</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">{site.description}</p>
          <div className="mt-6 rounded-2xl border bg-card/95 p-4 shadow-sm">
            <SearchForm />
          </div>
        </Container>
      </section>
      <Container className="grid gap-10">
        <section className="grid gap-4 md:grid-cols-3">
          <Step
            n="1"
            title="Post the job, free"
            body="Shops, clinics, and offices describe the work, the town, and a budget range. No subscription."
          />
          <Step
            n="2"
            title="Local trades see it"
            body="Contractors with a matching trade browse open requests and start a thread from the job."
          />
          <Step
            n="3"
            title="Listed contractors get found"
            body={`Search only shows contractors with an active ${listingPlans[0].name} or ${listingPlans[1].name} listing.`}
          />
        </section>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading the board…</p>}>
          <HomeLists />
        </Suspense>
      </Container>
    </>
  );
}

async function HomeLists() {
  await connection();
  const now = new Date();
  const [contractors, jobs] = await Promise.all([
    searchContractors({}, now),
    listJobs({ status: "OPEN" }),
  ]);
  const featured = contractors.filter((contractor) => contractor.listing?.tier === "FEATURED").slice(0, 3);

  return (
    <>
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl">Featured this month</h2>
          <Link href="/contractors" className="text-sm font-medium text-primary hover:underline">
            Full directory
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((contractor) => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl">Open requests</h2>
          <Link href="/jobs" className="text-sm font-medium text-primary hover:underline">
            Job board
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.slice(0, 4).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/signup" className={cn(buttonVariants(), "h-10 px-4")}>
            Create a free business account
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: "outline" }), "h-10 bg-card px-4")}>
            List your trade
          </Link>
        </div>
      </section>
    </>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-card/80 p-4">
      <p className="font-heading text-2xl text-clay">{n}</p>
      <h2 className="mt-1 text-lg">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
