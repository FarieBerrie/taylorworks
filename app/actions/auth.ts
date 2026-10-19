"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, destroySession } from "@/lib/auth";
import { cities } from "@/lib/config";
import { prisma } from "@/lib/db";
import { safeNextPath } from "@/lib/format";

export type AuthState = { error: string };

const signupSchema = z.object({
  role: z.enum(["CONTRACTOR", "CUSTOMER"]),
  name: z.string().trim().min(2, "Enter your name.").max(80),
  businessName: z.string().trim().min(2, "Enter the business name.").max(80),
  email: z.string().trim().email("Enter a valid email.").max(120),
  password: z.string().min(8, "Use at least 8 characters.").max(72),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().min(2).max(40),
});

async function authenticate(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"), "/dashboard");

  if (!email || !password) return { error: "Enter your email and password.", to: next };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Email or password does not match.", to: next };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok || (user.role !== "CONTRACTOR" && user.role !== "CUSTOMER")) {
    return { error: "Email or password does not match.", to: next };
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return { error: "", to: next === "/dashboard" ? "/dashboard" : next };
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const result = await authenticate(formData);
  if (result.error) return { error: result.error };
  redirect(result.to);
}

export async function loginDirect(formData: FormData) {
  const result = await authenticate(formData);
  if (result.error) redirect(`/login?error=${encodeURIComponent(result.error)}`);
  redirect(result.to);
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    role: formData.get("role"),
    name: formData.get("name"),
    businessName: formData.get("businessName"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") ?? "",
    city: formData.get("city"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const data = parsed.data;
  if (!cities.some((city) => city.label === data.city)) {
    return { error: "Pick a town in the Abilene area." };
  }

  const email = data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: data.name,
      role: data.role,
      customerProfile:
        data.role === "CUSTOMER"
          ? {
              create: {
                businessName: data.businessName,
                phone: data.phone ?? "",
                city: data.city,
              },
            }
          : undefined,
      contractorProfile:
        data.role === "CONTRACTOR"
          ? {
              create: {
                businessName: data.businessName,
                phone: data.phone ?? "",
                contactEmail: email,
                city: data.city,
                listing: { create: { status: "INACTIVE", tier: "BASIC" } },
              },
            }
          : undefined,
    },
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: data.role,
  });

  redirect(data.role === "CONTRACTOR" ? "/billing" : "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
