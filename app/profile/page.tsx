import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { ContractorProfileForm, CustomerProfileForm } from "@/components/profile-forms";
import { Container, PageHeading, PageSkeleton } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Profile" };
export const instant = false;

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");

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
    </Container>
  );
}
