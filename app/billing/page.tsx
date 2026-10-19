import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { setMockListing, startCheckout } from "@/app/actions/billing";
import { Container, Notice, PageHeading, PageSkeleton } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { listingPlans, site } from "@/lib/config";
import { prisma } from "@/lib/db";
import { firstParam } from "@/lib/format";
import { formatWhen } from "@/lib/format";
import { getBillingMode, isListingPublic, listingStatusLabel } from "@/lib/listing";

export const metadata = { title: "Listing" };
export const instant = false;

export default function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Billing searchParams={searchParams} />
    </Suspense>
  );
}

async function Billing({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/billing");
  if (session.role !== "CONTRACTOR") redirect("/dashboard");

  const [params, profile] = await Promise.all([
    searchParams,
    prisma.contractorProfile.findUnique({
      where: { userId: session.id },
      include: { listing: true },
    }),
  ]);
  if (!profile) redirect("/profile");

  const now = new Date();
  const mode = getBillingMode();
  const listed = isListingPublic(profile.listing, now);
  const checkout = firstParam(params.checkout);
  const listing = firstParam(params.listing);

  return (
    <Container>
      <PageHeading
        eyebrow={site.name}
        title="Your listing"
        description="Businesses browse free. A contractor profile appears in search only while a listing subscription is active."
      />
      <div className="mb-6 grid gap-3">
        {mode === "mock" ? (
          <Notice tone="info">
            Billing is in local mock mode. Activating a plan here does not charge a card. Set BILLING_MODE=stripe and
            the test keys in .env to use Stripe Checkout.
          </Notice>
        ) : null}
        {checkout === "success" ? (
          <Notice tone="ok">
            Checkout returned. The listing updates when Stripe sends the webhook. In local dev, run the Stripe CLI
            forwarder described in the README.
          </Notice>
        ) : null}
        {checkout === "cancel" ? <Notice>Checkout was canceled. The listing was not changed.</Notice> : null}
        {checkout === "missing-keys" ? (
          <Notice tone="warn">Stripe keys or price IDs are missing, so Checkout could not start.</Notice>
        ) : null}
        {listing === "active" ? <Notice tone="ok">Listing is active. You are in the public directory.</Notice> : null}
        {listing === "inactive" ? <Notice tone="warn">Listing turned off. Search will no longer show this profile.</Notice> : null}
        <p className="text-sm text-muted-foreground">
          Current status: <span className="font-medium text-foreground">{listingStatusLabel(profile.listing, now)}</span>
          {listed && profile.listing?.currentPeriodEnd
            ? ` through ${formatWhen(profile.listing.currentPeriodEnd)}`
            : ""}
          .
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {listingPlans.map((plan) => {
          const current = listed && profile.listing?.tier === plan.tier;
          return (
            <Card key={plan.tier} className={current ? "ring-2 ring-primary" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {current ? <Badge>Current</Badge> : null}
                </div>
                <p className="font-heading text-3xl">
                  {plan.price}
                  <span className="text-base text-muted-foreground">/{plan.interval}</span>
                </p>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p>{plan.summary}</p>
                <ul className="grid gap-1 text-sm text-muted-foreground">
                  {plan.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {mode === "mock" ? (
                  <form action={setMockListing}>
                    <input type="hidden" name="tier" value={plan.tier} />
                    <input type="hidden" name="active" value="1" />
                    <Button type="submit" className="h-10" variant={current ? "outline" : "default"}>
                      {current ? "Renew this plan" : `Activate ${plan.name}`}
                    </Button>
                  </form>
                ) : (
                  <form action={startCheckout}>
                    <input type="hidden" name="tier" value={plan.tier} />
                    <Button type="submit" className="h-10">
                      Subscribe with Stripe
                    </Button>
                  </form>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {mode === "mock" && listed ? (
        <form action={setMockListing} className="mt-4">
          <input type="hidden" name="active" value="0" />
          <Button type="submit" variant="ghost" className="h-10 px-3">
            Turn listing off
          </Button>
        </form>
      ) : null}
    </Container>
  );
}
