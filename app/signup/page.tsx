import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth-forms";
import { Container, PageHeading, PageSkeleton } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Sign up" };
export const instant = false;

export default function SignupPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SignupContent />
    </Suspense>
  );
}

async function SignupContent() {
  await connection();
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <Container className="max-w-2xl">
      <PageHeading
        eyebrow="Join"
        title="Create an account"
        description="Pick a business account to hire, or a contractor account to be listed."
      />
      <Card>
        <CardContent>
          <SignupForm />
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
