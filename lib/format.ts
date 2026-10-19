export function formatMoney(dollars: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function formatBudget(min: number | null, max: number | null) {
  if (min != null && max != null) return `${formatMoney(min)}–${formatMoney(max)}`;
  if (min != null) return `From ${formatMoney(min)}`;
  if (max != null) return `Up to ${formatMoney(max)}`;
  return "Budget open";
}

export function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatWhenShort(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function parseDollars(value: FormDataEntryValue | null) {
  const raw = String(value ?? "")
    .trim()
    .replace(/[$,]/g, "");
  if (!raw) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) return Number.NaN;
  return Math.round(amount);
}

export function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function safeNextPath(value: FormDataEntryValue | string | null | undefined, fallback: string) {
  const next = String(value ?? "");
  if (next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) return next;
  return fallback;
}

export function partyName(user: {
  name: string;
  contractorProfile?: { businessName: string } | null;
  customerProfile?: { businessName: string } | null;
}) {
  return user.contractorProfile?.businessName || user.customerProfile?.businessName || user.name;
}
