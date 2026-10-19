"use client";

import { useActionState } from "react";

import { updateContractorProfile, updateCustomerProfile, type ProfileState } from "@/app/actions/profile";
import { fieldClass } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cities, serviceAreas, trades } from "@/lib/config";

const initial: ProfileState = { error: "", saved: false };

export function ContractorProfileForm({
  values,
}: {
  values: {
    businessName: string;
    description: string;
    phone: string;
    contactEmail: string;
    website: string;
    licenseNotes: string;
    insuranceNotes: string;
    city: string;
    trades: string[];
    areas: string[];
  };
}) {
  const [state, action, pending] = useActionState(updateContractorProfile, initial);
  return (
    <form action={action} className="grid gap-5">
      <Status state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name" id="businessName">
          <Input id="businessName" name="businessName" defaultValue={values.businessName} required className="h-10 bg-card" />
        </Field>
        <Field label="Home base" id="city">
          <select id="city" name="city" defaultValue={values.city} className={fieldClass}>
            {cities.map((city) => (
              <option key={city.label}>{city.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Description" id="description">
        <Textarea
          id="description"
          name="description"
          defaultValue={values.description}
          required
          className="min-h-32 bg-card"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" id="phone">
          <Input id="phone" name="phone" defaultValue={values.phone} required className="h-10 bg-card" />
        </Field>
        <Field label="Contact email" id="contactEmail">
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={values.contactEmail}
            required
            className="h-10 bg-card"
          />
        </Field>
      </div>
      <Field label="Website" id="website" hint="Optional.">
        <Input id="website" name="website" defaultValue={values.website} className="h-10 bg-card" />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Trades</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {trades.map((trade) => (
            <label key={trade.slug} className="flex items-center gap-2 text-sm">
              <Checkbox name="trades" value={trade.slug} defaultChecked={values.trades.includes(trade.slug)} />
              {trade.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Service area</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {serviceAreas.map((area) => (
            <label key={area.label} className="flex items-center gap-2 text-sm">
              <Checkbox name="areas" value={area.label} defaultChecked={values.areas.includes(area.label)} />
              {area.kind === "zip" ? area.label : area.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Licensing notes" id="licenseNotes">
        <Textarea
          id="licenseNotes"
          name="licenseNotes"
          defaultValue={values.licenseNotes}
          required
          className="min-h-24 bg-card"
        />
      </Field>
      <Field label="Insurance notes" id="insuranceNotes">
        <Textarea
          id="insuranceNotes"
          name="insuranceNotes"
          defaultValue={values.insuranceNotes}
          required
          className="min-h-24 bg-card"
        />
      </Field>
      <Button type="submit" disabled={pending} className="h-10 sm:w-fit">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function CustomerProfileForm({
  values,
}: {
  values: { businessName: string; description: string; phone: string; city: string };
}) {
  const [state, action, pending] = useActionState(updateCustomerProfile, initial);
  return (
    <form action={action} className="grid gap-4">
      <Status state={state} />
      <Field label="Business name" id="businessName">
        <Input id="businessName" name="businessName" defaultValue={values.businessName} required className="h-10 bg-card" />
      </Field>
      <Field label="About the business" id="description">
        <Textarea id="description" name="description" defaultValue={values.description} className="min-h-28 bg-card" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" id="phone">
          <Input id="phone" name="phone" defaultValue={values.phone} className="h-10 bg-card" />
        </Field>
        <Field label="Town" id="city">
          <select id="city" name="city" defaultValue={values.city} className={fieldClass}>
            {cities.map((city) => (
              <option key={city.label}>{city.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <Button type="submit" disabled={pending} className="h-10 sm:w-fit">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Status({ state }: { state: ProfileState }) {
  if (state.error) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.saved) {
    return <p className="rounded-lg border border-sage/30 bg-sage/10 px-3 py-2 text-sm">Saved.</p>;
  }
  return null;
}
