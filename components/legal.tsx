import { Container, PageHeading } from "@/components/shell";
import { business } from "@/lib/config";

/** Layout for the Terms, Privacy and Contact pages: readable line length, dated. */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Container className="max-w-3xl">
      <PageHeading eyebrow={business.legalName} title={title} description={`Last updated ${business.policiesUpdated}.`} />
      <div className="grid gap-8 text-[15px] leading-relaxed [&_a]:text-primary [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:grid [&_ul]:gap-1">
        {children}
      </div>
    </Container>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-heading text-xl">{title}</h2>
      {children}
    </section>
  );
}

export function ContactLink() {
  return <a href={`mailto:${business.contactEmail}`}>{business.contactEmail}</a>;
}
