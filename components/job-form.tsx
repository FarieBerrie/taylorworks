"use client";

import { useActionState } from "react";

import { createJob, type FormState } from "@/app/actions/jobs";
import { fieldClass } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cities, trades } from "@/lib/config";

const initial: FormState = { error: "" };

export function JobForm() {
  const [state, action, pending] = useActionState(createJob, initial);
  return (
    <form action={action} className="grid gap-4">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required className="h-10 bg-card" placeholder="Replace two hose bibs" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">What needs doing</Label>
        <Textarea id="description" name="description" required minLength={20} className="min-h-32 bg-card" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="trade">Trade</Label>
          <select id="trade" name="trade" required className={fieldClass} defaultValue="">
            <option value="" disabled>
              Choose a trade
            </option>
            {trades.map((trade) => (
              <option key={trade.slug} value={trade.slug}>
                {trade.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="timeline">Timeline</Label>
          <Input id="timeline" name="timeline" required className="h-10 bg-card" placeholder="Within 2 weeks" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="city">Town</Label>
          <select id="city" name="city" defaultValue="Abilene" className={fieldClass}>
            {cities.map((city) => (
              <option key={city.label} value={city.label}>
                {city.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="zip">ZIP</Label>
          <Input id="zip" name="zip" className="h-10 bg-card" placeholder="79601" />
        </div>
        <div className="grid gap-1.5 sm:col-span-1">
          <Label htmlFor="budgetMin">Budget low</Label>
          <Input id="budgetMin" name="budgetMin" inputMode="numeric" className="h-10 bg-card" placeholder="500" />
        </div>
      </div>
      <div className="grid gap-1.5 sm:max-w-xs">
        <Label htmlFor="budgetMax">Budget high</Label>
        <Input id="budgetMax" name="budgetMax" inputMode="numeric" className="h-10 bg-card" placeholder="1500" />
      </div>
      <Button type="submit" disabled={pending} className="h-10 sm:w-fit">
        {pending ? "Posting…" : "Post job"}
      </Button>
    </form>
  );
}
