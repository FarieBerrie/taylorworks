import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { DemoLogins, LoginForm } from "@/components/auth-forms";
import { Container, Notice, PageHeading, PageSkeleton } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { demoLoginsEnabled } from "@/lib/env";
import { firstParam, safeNextPath } from "@/lib/format";

export const metadata = { title: "Log in" };
export const instant = false;

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const session = await getSession();
  const params = await searchParams;
  const next = safeNextPath(firstParam(params.next), "/dashboard");
  if (session) redirect(next);
  const error = firstParam(params.error);
  const reset = firstParam(params.reset) === "1";

  return (
    <Container className="max-w-lg">
      <PageHeading eyebrow="Welcome back" title="Log in" description="Businesses and contractors use the same door." />
      <Card>
        <CardContent className="grid gap-6">
          {reset ? <Notice tone="ok">Password updated. Log in with the new one.</Notice> : null}
          <LoginForm next={next} error={error} />
          <p className="-mt-3 text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </p>
          {demoLoginsEnabled() ? <DemoLogins next={next} /> : null}
          <p className="text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
