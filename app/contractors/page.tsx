import { Suspense } from "react";
import { connection } from "next/server";

import { ContractorCard } from "@/components/contractor-card";
import { SearchForm } from "@/components/search-form";
import { Container, Notice, PageHeading, PageSkeleton } from "@/components/shell";
import { isTradeSlug, serviceAreas, site } from "@/lib/config";
import { firstParam } from "@/lib/format";
import { searchContractors } from "@/lib/queries";

export const metadata = { title: "Find contractors" };
export const instant = false;

export default function ContractorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContractorResults searchParams={searchParams} />
    </Suspense>
  );
}

async function ContractorResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const params = await searchParams;
  const trade = firstParam(params.trade);
  const area = firstParam(params.area);
  const q = firstParam(params.q);
  const safeTrade = isTradeSlug(trade) ? trade : "";
  const safeArea = serviceAreas.some((item) => item.label === area) ? area : "";
  const contractors = await searchContractors(
    { trade: safeTrade || undefined, area: safeArea || undefined, q },
    new Date(),
  );

  return (
    <Container>
      <PageHeading
        eyebrow={site.city}
        title="Contractor directory"
        description="Only contractors with an active listing appear here. Featured listings sort first."
      />
      <div className="mb-6 rounded-2xl border bg-card/90 p-4">
        <SearchForm trade={safeTrade} area={safeArea} q={q} />
      </div>
      {contractors.length === 0 ? (
        <Notice>No listed contractors match that search. Try another trade or clear the town filter.</Notice>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contractors.map((contractor) => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </div>
      )}
    </Container>
  );
}
