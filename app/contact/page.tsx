import Link from "next/link";

import { ContactLink, LegalPage, Section } from "@/components/legal";
import { business, site } from "@/lib/config";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <LegalPage title="Contact us">
      <p>
        {site.name} is run by {business.legalName} in {business.location}. Email us at <ContactLink /> and
        we&apos;ll reply within two business days.
      </p>

      <Section title="Billing and listings">
        <p>
          To change your plan, update your card or cancel, use Manage subscription on the{" "}
          <Link href="/billing">Listing</Link> page. For a charge you don&apos;t recognize or think is wrong, email us
          and include the email address on your account.
        </p>
      </Section>

      <Section title="Accounts">
        <p>
          Locked out? <Link href="/forgot-password">Reset your password</Link>. To close your account or get a copy
          of your information, email us from the address on the account.
        </p>
      </Section>

      <Section title="Report a problem">
        <p>
          If a listing, job or message looks fraudulent, abusive or unsafe, email us with a link to it and we&apos;ll
          look into it.
        </p>
      </Section>
    </LegalPage>
  );
}
