import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { ResetPasswordForm } from "@/components/password-forms";
import { Container, PageHeading, PageSkeleton } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";
import { firstParam } from "@/lib/format";
import { findUsableResetToken } from "@/lib/password-reset";

export const metadata = { title: "Choose a new password" };
export const instant = false;

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ResetContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const token = firstParam((await searchParams).token) ?? "";
  const usable = await findUsableResetToken(token);

  return (
    <Container className="max-w-lg">
      <PageHeading eyebrow="Account" title="Choose a new password" />
      <Card>
        <CardContent className="grid gap-6">
          {usable ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm">
              This reset link has expired or was already used.{" "}
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                Ask for a new one
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
