"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, signup, type AuthState } from "@/app/actions/auth";
import { fieldClass } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cities, demoAccounts } from "@/lib/config";
import { loginDirect } from "@/app/actions/auth";

const initial: AuthState = { error: "" };

export function LoginForm({ next, error }: { next: string; error?: string }) {
  const [state, action, pending] = useActionState(login, { error: error ?? "" });
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-10 bg-card" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 bg-card"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}

export function DemoLogins({ next }: { next: string }) {
  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">
        Sample accounts use the password <span className="font-medium text-foreground">{demoAccounts.password}</span>.
      </p>
      <form action={loginDirect}>
        <input type="hidden" name="email" value={demoAccounts.customer.email} />
        <input type="hidden" name="password" value={demoAccounts.password} />
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="outline" className="h-10 w-full bg-card">
          Enter as {demoAccounts.customer.label}
        </Button>
      </form>
      <form action={loginDirect}>
        <input type="hidden" name="email" value={demoAccounts.contractor.email} />
        <input type="hidden" name="password" value={demoAccounts.password} />
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="outline" className="h-10 w-full bg-card">
          Enter as {demoAccounts.contractor.label}
        </Button>
      </form>
    </div>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, initial);
  return (
    <form action={action} className="grid gap-4">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">I am a</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="role" value="CUSTOMER" defaultChecked className="accent-primary" />
          Business looking for a contractor
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="role" value="CONTRACTOR" className="accent-primary" />
          Contractor who wants to be listed
        </label>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required autoComplete="name" className="h-10 bg-card" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="businessName">Business name</Label>
          <Input id="businessName" name="businessName" required className="h-10 bg-card" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" className="h-10 bg-card" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" className="h-10 bg-card" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-10 bg-card"
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Business accounts are free. Contractor profiles stay off the public directory until a listing is active.
      </p>
      <p className="text-sm text-muted-foreground">
        By creating an account you agree to the{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
