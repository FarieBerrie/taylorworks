"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { areaKind, cities, isTradeSlug } from "@/lib/config";
import { prisma } from "@/lib/db";

export type ProfileState = { error: string; saved: boolean };

const contractorSchema = z.object({
  businessName: z.string().trim().min(2, "Enter the business name.").max(80),
  description: z.string().trim().min(20, "Add a short description of the work you do.").max(2000),
  phone: z.string().trim().min(7, "Add a phone number.").max(30),
  contactEmail: z.string().trim().email("Enter a contact email.").max(120),
  website: z.string().trim().max(200).optional(),
  licenseNotes: z.string().trim().min(8, "Add a note about licensing.").max(500),
  insuranceNotes: z.string().trim().min(8, "Add a note about insurance.").max(500),
  city: z.string().refine((city) => cities.some((item) => item.label === city), "Pick a home-base town."),
});

const customerSchema = z.object({
  businessName: z.string().trim().min(2, "Enter the business name.").max(80),
  description: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(30).optional(),
  city: z.string().refine((city) => cities.some((item) => item.label === city), "Pick a town."),
});

export async function updateContractorProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");
  if (session.role !== "CONTRACTOR") return { error: "This form is for contractor accounts.", saved: false };

  const parsed = contractorSchema.safeParse({
    businessName: formData.get("businessName"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    contactEmail: formData.get("contactEmail"),
    website: formData.get("website") ?? "",
    licenseNotes: formData.get("licenseNotes"),
    insuranceNotes: formData.get("insuranceNotes"),
    city: formData.get("city"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form.", saved: false };

  const tradeValues = formData.getAll("trades").map(String).filter(isTradeSlug);
  const areaValues = formData
    .getAll("areas")
    .map(String)
    .filter((label) => areaKind(label));
  if (tradeValues.length === 0) return { error: "Pick at least one trade.", saved: false };
  if (areaValues.length === 0) return { error: "Pick at least one town or ZIP.", saved: false };

  const profile = await prisma.contractorProfile.findUnique({ where: { userId: session.id } });
  if (!profile) return { error: "Profile not found.", saved: false };

  await prisma.$transaction([
    prisma.contractorProfile.update({
      where: { id: profile.id },
      data: {
        businessName: parsed.data.businessName,
        description: parsed.data.description,
        phone: parsed.data.phone,
        contactEmail: parsed.data.contactEmail.toLowerCase(),
        website: parsed.data.website ?? "",
        licenseNotes: parsed.data.licenseNotes,
        insuranceNotes: parsed.data.insuranceNotes,
        city: parsed.data.city,
      },
    }),
    prisma.contractorTrade.deleteMany({ where: { contractorProfileId: profile.id } }),
    prisma.serviceArea.deleteMany({ where: { contractorProfileId: profile.id } }),
    prisma.contractorTrade.createMany({
      data: tradeValues.map((trade) => ({ contractorProfileId: profile.id, trade })),
    }),
    prisma.serviceArea.createMany({
      data: areaValues.map((label) => ({
        contractorProfileId: profile.id,
        label,
        kind: areaKind(label) ?? "city",
      })),
    }),
  ]);

  revalidatePath("/profile");
  revalidatePath("/contractors");
  revalidatePath(`/contractors/${profile.id}`);
  revalidatePath("/dashboard");
  return { error: "", saved: true };
}

export async function updateCustomerProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");
  if (session.role !== "CUSTOMER") return { error: "This form is for business accounts.", saved: false };

  const parsed = customerSchema.safeParse({
    businessName: formData.get("businessName"),
    description: formData.get("description") ?? "",
    phone: formData.get("phone") ?? "",
    city: formData.get("city"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form.", saved: false };

  await prisma.customerProfile.update({
    where: { userId: session.id },
    data: {
      businessName: parsed.data.businessName,
      description: parsed.data.description ?? "",
      phone: parsed.data.phone ?? "",
      city: parsed.data.city,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { error: "", saved: true };
}
