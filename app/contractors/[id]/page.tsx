import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

import { startConversation } from "@/app/actions/messages";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Notice, PageSkeleton } from "@/components/shell";
import { getSession } from "@/lib/auth";
import { tradeLabel } from "@/lib/config";
import { getContractor } from "@/lib/queries";
import { isListingPublic } from "@/lib/listing";
import { cn } from "cn";

export const instant = false;

export default function ContractorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Profile params={params} />
    </Suspense>
  );
}

async function Profile({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [contractor, session] = await Promise.all([getContractor(id), getSession()]);
  if (!contractor) notFound();

  const now = new Date();
  const isOwner = session?.id === contractor.userId;
  const listed = isListingPublic(contractor.listing, now);
  if (!listed && !isOwner) notFound();

  const towns = contractor.areas.filter((area) => area.kind === "city");
  const zips = contractor.areas.filter((area) => area.kind === "zip");
  const featured = contractor.listing?.tier === "FEATURED" && listed;

  return (
    <Container className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid gap-4">
        {!listed ? (
          <Notice tone="warn">
            This profile is hidden from search until the listing is active.{" "}
            <Link href="/billing" className="font-medium underline">
              Manage listing
            </Link>
          </Notice>
        ) : null}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {featured ? <Badge className="border-transparent bg-clay text-white">Featured</Badge> : null}
            {contractor.trades.map((item) => (
              <Badge key={item.trade} variant="secondary">
                {tradeLabel(item.trade)}
              </Badge>
            ))}
          </div>
          <h1 className="mt-2 text-4xl">{contractor.businessName}</h1>
          <p className="mt-1 text-muted-foreground">Based in {contractor.city}, Texas</p>
        </div>
        <p className="max-w-2xl text-base leading-relaxed">
          {contractor.description || "This contractor has not added a description yet."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Licensing</CardTitle>
            </CardHeader>
            <CardContent>{contractor.licenseNotes || "No licensing note yet."}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Insurance</CardTitle>
            </CardHeader>
            <CardContent>{contractor.insuranceNotes || "No insurance note yet."}</CardContent>
          </Card>
        </div>
      </div>
      <aside className="grid h-fit gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>{contractor.phone || "Phone not listed"}</p>
            <p>{contractor.contactEmail}</p>
            {contractor.website ? (
              <a href={contractor.website} className="text-primary hover:underline">
                {contractor.website.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
            <p className="text-muted-foreground">Messages stay on the board so both sides have a record.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service area</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>{towns.map((area) => area.label).join(", ") || "Towns not set"}</p>
            <p className="text-muted-foreground">{zips.map((area) => area.label).join(", ")}</p>
          </CardContent>
        </Card>
        {session?.role === "CUSTOMER" && listed ? (
          <form action={startConversation}>
            <input type="hidden" name="contractorUserId" value={contractor.userId} />
            <Button type="submit" className="h-10 w-full">
              Message {contractor.businessName}
            </Button>
          </form>
        ) : null}
        {!session && listed ? (
          <Link
            href={`/login?next=/contractors/${contractor.id}`}
            className={cn(buttonVariants(), "inline-flex h-10 justify-center")}
          >
            Log in to message
          </Link>
        ) : null}
      </aside>
    </Container>
  );
}
