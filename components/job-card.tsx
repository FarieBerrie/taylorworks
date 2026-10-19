import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tradeLabel } from "@/lib/config";
import { formatBudget, formatWhen } from "@/lib/format";

export function JobCard({
  job,
}: {
  job: {
    id: string;
    title: string;
    description: string;
    trade: string;
    city: string;
    zip: string;
    budgetMin: number | null;
    budgetMax: number | null;
    timeline: string;
    status: string;
    createdAt: Date;
    customer: {
      name: string;
      customerProfile: { businessName: string } | null;
    };
  };
}) {
  const business = job.customer.customerProfile?.businessName ?? job.customer.name;
  return (
    <Card className="bg-card/95">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{tradeLabel(job.trade)}</Badge>
          {job.status === "CLOSED" ? <Badge variant="outline">Closed</Badge> : null}
          <span className="text-xs text-muted-foreground">{formatWhen(job.createdAt)}</span>
        </div>
        <CardTitle className="text-xl">
          <Link href={`/jobs/${job.id}`} className="hover:underline">
            {job.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <p className="line-clamp-2 text-muted-foreground">{job.description}</p>
        <p>
          {business} · {job.city}
          {job.zip ? ` ${job.zip}` : ""}
        </p>
        <p>
          {formatBudget(job.budgetMin, job.budgetMax)} · {job.timeline}
        </p>
      </CardContent>
    </Card>
  );
}
