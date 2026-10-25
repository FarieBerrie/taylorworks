import Link from "next/link";

import { ForgotPasswordForm } from "@/components/password-forms";
import { Container, PageHeading } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <Container className="max-w-lg">
      <PageHeading
        eyebrow="Account"
        title="Forgot your password?"
        description="Enter your account email and we'll send a link to choose a new one."
      />
      <Card>
        <CardContent className="grid gap-6">
          <ForgotPasswordForm />
          <p className="text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
