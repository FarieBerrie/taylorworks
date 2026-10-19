import { cn } from "cn";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)}>{children}</div>;
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 max-w-2xl">
      {eyebrow ? (
        <p className="text-xs font-medium tracking-[0.16em] text-clay uppercase">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-3xl leading-tight text-balance sm:text-4xl">{title}</h1>
      {description ? <p className="mt-2 text-base text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "ok";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "warn"
      ? "border-clay/40 bg-clay/10"
      : tone === "ok"
        ? "border-sage/30 bg-sage/10"
        : "border-primary/20 bg-primary/5";
  return <div className={cn("rounded-xl border px-4 py-3 text-sm", toneClass)}>{children}</div>;
}

export function PageSkeleton() {
  return (
    <Container>
      <div className="h-4 w-28 animate-pulse rounded bg-sand" />
      <div className="mt-3 h-10 w-2/3 max-w-md animate-pulse rounded bg-sand" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl bg-sand/80" />
        <div className="h-40 animate-pulse rounded-xl bg-sand/80" />
      </div>
    </Container>
  );
}

export const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
