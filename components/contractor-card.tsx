import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { tradeLabel } from "@/lib/config";

export function ContractorCard({
  contractor,
}: {
  contractor: {
    id: string;
    businessName: string;
    description: string;
    city: string;
    trades: { trade: string }[];
    areas: { label: string; kind: string }[];
    listing: { tier: string } | null;
  };
}) {
  const towns = contractor.areas.filter((area) => area.kind === "city").map((area) => area.label);
  const featured = contractor.listing?.tier === "FEATURED";

  return (
    <Card className="h-full bg-card/95">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          {featured ? <Badge className="border-transparent bg-clay text-white">Featured</Badge> : null}
          <span className="text-xs text-muted-foreground">Based in {contractor.city}</span>
        </div>
        <CardTitle className="text-xl">
          <Link href={`/contractors/${contractor.id}`} className="hover:underline">
            {contractor.businessName}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap gap-1.5">
          {contractor.trades.map((item) => (
            <Badge key={item.trade} variant="secondary">
              {tradeLabel(item.trade)}
            </Badge>
          ))}
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {contractor.description || "Profile details coming soon."}
        </p>
        {towns.length > 0 ? (
          <p className="text-sm">
            <span className="text-muted-foreground">Serves </span>
            {towns.join(", ")}
          </p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Link href={`/contractors/${contractor.id}`} className="text-sm font-medium text-primary hover:underline">
          View profile
        </Link>
      </CardFooter>
    </Card>
  );
}
