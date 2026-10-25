import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { activeListingWhere } from "@/lib/listing";

const contractorCardInclude = {
  trades: true,
  areas: true,
  listing: true,
} satisfies Prisma.ContractorProfileInclude;

export async function searchContractors(
  filters: { trade?: string; area?: string; q?: string },
  now: Date,
) {
  const query = filters.q?.trim();
  const where: Prisma.ContractorProfileWhereInput = {
    AND: [
      activeListingWhere(now),
      filters.trade ? { trades: { some: { trade: filters.trade } } } : {},
      filters.area ? { areas: { some: { label: filters.area } } } : {},
      query
        ? {
            OR: [
              { businessName: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const rows = await prisma.contractorProfile.findMany({
    where,
    include: contractorCardInclude,
  });

  return rows.sort((a, b) => {
    const featuredA = a.listing?.tier === "FEATURED" ? 0 : 1;
    const featuredB = b.listing?.tier === "FEATURED" ? 0 : 1;
    if (featuredA !== featuredB) return featuredA - featuredB;
    return a.businessName.localeCompare(b.businessName);
  });
}

export async function getContractor(id: string) {
  return prisma.contractorProfile.findUnique({
    where: { id },
    include: {
      ...contractorCardInclude,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

const jobInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      customerProfile: { select: { businessName: true, city: true, phone: true } },
    },
  },
} satisfies Prisma.JobRequestInclude;

export async function listJobs(filters: {
  status?: string;
  trade?: string;
  trades?: string[];
  customerId?: string;
}) {
  return prisma.jobRequest.findMany({
    where: {
      status: filters.status,
      trade: filters.trade
        ? filters.trade
        : filters.trades
          ? { in: filters.trades }
          : undefined,
      customerId: filters.customerId,
    },
    include: jobInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getJob(id: string) {
  return prisma.jobRequest.findUnique({
    where: { id },
    include: jobInclude,
  });
}

const threadUserSelect = {
  id: true,
  name: true,
  role: true,
  contractorProfile: { select: { businessName: true, id: true } },
  customerProfile: { select: { businessName: true } },
} satisfies Prisma.UserSelect;

export async function listConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ contractorId: userId }, { customerId: userId }] },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      jobRequest: { select: { id: true, title: true, trade: true } },
      contractor: { select: threadUserSelect },
      customer: { select: threadUserSelect },
    },
    orderBy: { updatedAt: "desc" },
  });

  const unread = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: { OR: [{ contractorId: userId }, { customerId: userId }] },
    },
    _count: { _all: true },
  });

  const unreadById = new Map(unread.map((row) => [row.conversationId, row._count._all]));
  return conversations.map((conversation) => ({
    ...conversation,
    unread: unreadById.get(conversation.id) ?? 0,
  }));
}

export async function getConversation(id: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, name: true } } } },
      jobRequest: { select: { id: true, title: true, trade: true, city: true } },
      contractor: { select: threadUserSelect },
      customer: { select: threadUserSelect },
    },
  });
  if (!conversation) return null;
  if (conversation.contractorId !== userId && conversation.customerId !== userId) return null;
  return conversation;
}

export async function unreadCount(userId: string) {
  return prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: { OR: [{ contractorId: userId }, { customerId: userId }] },
    },
  });
}

export async function markConversationRead(conversationId: string, userId: string) {
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
}
