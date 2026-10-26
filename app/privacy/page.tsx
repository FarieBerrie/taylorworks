import Link from "next/link";

import { ContactLink, LegalPage, Section } from "@/components/legal";
import { business, site } from "@/lib/config";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what {business.legalName} collects when you use {site.name}, why, and the choices you
        have. We keep it short because we collect little: what the site needs to work, and nothing for advertising.
      </p>

      <Section title="What we collect">
        <ul>
          <li>
            <strong>Account details:</strong> your name, email address, role (business or contractor) and town. Your
            password is stored only as a one-way hash; we can&apos;t read it.
          </li>
          <li>
            <strong>Profile details:</strong> business name, description, phone, contact email, website, service
            area, and (for contractors) notes on licensing and insurance.
          </li>
          <li>
            <strong>Jobs and messages:</strong> the job requests you post and the messages you send through the site.
          </li>
          <li>
            <strong>Billing:</strong> card payments are handled by Stripe. We never see or store card numbers; we keep
            the Stripe customer and subscription references, your plan, and its status.
          </li>
          <li>
            <strong>Technical data:</strong> your IP address is used briefly to limit repeated login attempts and
            other abuse, and appears in our hosting provider&apos;s server logs.
          </li>
        </ul>
      </Section>

      <Section title="What others can see">
        <ul>
          <li>
            Contractor profiles with an active listing are public, including the phone, contact email and website
            the contractor chooses to show.
          </li>
          <li>
            Job requests are public, showing the business name, town, ZIP code, budget, timeline and description.
          </li>
          <li>Messages are visible only to the two people in the conversation.</li>
        </ul>
      </Section>

      <Section title="How we use it">
        <ul>
          <li>To run {site.name}: show profiles and jobs, deliver messages, and manage listing subscriptions.</li>
          <li>
            To email you about your account (such as password reset links) and, unless you switch it off on your{" "}
            <Link href="/profile">profile</Link>, when someone messages you.
          </li>
          <li>To keep the site secure and prevent spam and abuse.</li>
        </ul>
        <p>We don&apos;t sell your information, and we don&apos;t use advertising or tracking cookies.</p>
      </Section>

      <Section title="Who we share it with">
        <p>Only the service providers that run parts of the site for us, and only for that purpose:</p>
        <ul>
          <li>Render, which hosts the site and its database.</li>
          <li>Stripe, which processes listing payments.</li>
          <li>Resend, which delivers our emails.</li>
        </ul>
        <p>
          We may also disclose information if the law requires it, or to protect people or the site from harm. If
          {` ${site.name}`} is ever sold or merged, your information would pass to the new owner under this policy.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          We use one essential cookie, which keeps you logged in. It is removed when you log out or after 14 days.
          There are no analytics or advertising cookies.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep your information while your account is open. When you close it, we delete your profile, jobs and
          messages, except records we must keep by law, such as billing records.
        </p>
      </Section>

      <Section title="Your choices">
        <ul>
          <li>Edit your profile at any time, and switch message emails on or off on your profile page.</li>
          <li>Ask us for a copy of your information, to correct it, or to delete your account: <ContactLink />.</li>
        </ul>
      </Section>

      <Section title="Security">
        <p>
          The site is served over HTTPS, passwords are hashed, and login attempts are rate-limited. No system is
          perfectly secure, so please use a password you don&apos;t use anywhere else.
        </p>
      </Section>

      <Section title="Children">
        <p>{site.name} is for businesses and contractors and isn&apos;t meant for anyone under 18.</p>
      </Section>

      <Section title="Changes">
        <p>
          If we change this policy, we&apos;ll post the new version here with a new date, and email account holders
          about significant changes.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions or requests about your information: <ContactLink />.
        </p>
      </Section>
    </LegalPage>
  );
}
