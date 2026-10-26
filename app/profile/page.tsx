import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { updateEmailPreferences } from "@/app/actions/profile";
import { ContractorProfileForm, CustomerProfileForm } from "@/components/profile-forms";
import { Container, Notice, PageHeading, PageSkeleton } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { firstParam } from "@/lib/format";

export const metadata = { title: "Profile" };
export const instant = false;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Profile searchParams={searchParams} />
    </Suspense>
  );
}

/** The switch for new-message emails, under either kind of profile. */
function EmailPreferences({ enabled, saved }: { enabled: boolean; saved: boolean }) {
  return (
    <Card className="mt-6">
      <CardContent>
        <form action={updateEmailPreferences} className="grid gap-4">
          <h2 className="font-heading text-xl">Email notifications</h2>
          {saved ? <Notice tone="ok">Saved.</Notice> : null}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="emailMessages"
              defaultChecked={enabled}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              Email me when someone sends me a message. You get one email per conversation until you read it.
            </span>
          </label>
          <div>
            <Button type="submit" variant="outline" className="h-10">
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

async function Profile({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");
  const [params, user] = await Promise.all([
    searchParams,
    prisma.user.findUnique({ where: { id: session.id }, select: { emailMessages: true } }),
  ]);
  const emailPreferences = (
    <EmailPreferences enabled={user?.emailMessages ?? true} saved={firstParam(params.emails) === "saved"} />
  );

  if (session.role === "CONTRACTOR") {
    const profile = await prisma.contractorProfile.findUnique({
      where: { userId: session.id },
      include: { trades: true, areas: true },
    });
    if (!profile) redirect("/dashboard");
    return (
      <Container className="max-w-3xl">
        <PageHeading
          eyebrow="Contractor profile"
          title="What businesses see"
          description="Trades and service area drive search. The public directory still requires an active listing."
        />
        <Card>
          <CardContent>
            <ContractorProfileForm
              values={{
                businessName: profile.businessName,
                description: profile.description,
                phone: profile.phone,
                contactEmail: profile.contactEmail,
                website: profile.website,
                licenseNotes: profile.licenseNotes,
                insuranceNotes: profile.insuranceNotes,
                city: profile.city,
                trades: profile.trades.map((trade) => trade.trade),
                areas: profile.areas.map((area) => area.label),
              }}
            />
          </CardContent>
        </Card>
        {emailPreferences}
      </Container>
    );
  }

  const profile = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
  if (!profile) redirect("/dashboard");
  return (
    <Container className="max-w-2xl">
      <PageHeading eyebrow="Business profile" title="Your business" description="This name shows on the jobs you post." />
      <Card>
        <CardContent>
          <CustomerProfileForm
            values={{
              businessName: profile.businessName,
              description: profile.description,
              phone: profile.phone,
              city: profile.city,
            }}
          />
        </CardContent>
      </Card>
      {emailPreferences}
    </Container>
  );
}
