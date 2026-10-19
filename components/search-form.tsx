import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fieldClass } from "@/components/shell";
import { serviceAreas, trades } from "@/lib/config";

export function SearchForm({
  trade = "",
  area = "",
  q = "",
}: {
  trade?: string;
  area?: string;
  q?: string;
}) {
  return (
    <form action="/contractors" className="grid gap-3 sm:grid-cols-[1fr_1fr_1.3fr_auto]">
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Trade</span>
        <select name="trade" defaultValue={trade} className={fieldClass}>
          <option value="">All trades</option>
          {trades.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Town or ZIP</span>
        <select name="area" defaultValue={area} className={fieldClass}>
          <option value="">Anywhere nearby</option>
          {serviceAreas.map((item) => (
            <option key={item.label} value={item.label}>
              {item.kind === "zip" ? item.label : `${item.label}, TX`}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Keywords</span>
        <Input name="q" defaultValue={q} placeholder="Rooftop, storefront, panel…" className="h-10 bg-card" />
      </label>
      <div className="flex items-end">
        <Button type="submit" className="h-10 w-full px-4 sm:w-auto">
          Search
        </Button>
      </div>
    </form>
  );
}
