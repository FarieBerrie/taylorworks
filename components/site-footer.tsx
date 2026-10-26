import Link from "next/link";

import { site } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-cream/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-heading text-lg text-foreground">{site.name}</p>
          <p className="mt-1 max-w-md">
            A local board for {site.city} and nearby {site.region} towns. Businesses join free.
            Contractors subscribe to appear in search.
          </p>
        </div>
        <div className="grid gap-2 sm:justify-items-end">
          <div className="flex flex-wrap gap-4">
            <Link href="/contractors" className="hover:text-foreground">
              Directory
            </Link>
            <Link href="/jobs" className="hover:text-foreground">
              Job board
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Join
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
