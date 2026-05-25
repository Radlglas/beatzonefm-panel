"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createWarning(userId: number, reason: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) return { error: "Nicht angemeldet." };
  if (session.user.role !== "admin") return { error: "Keine Berechtigung." };

  const trimmed = reason.trim();
  if (!trimmed) return { error: "Bitte einen Grund angeben." };
  if (trimmed.length > 300) return { error: "Grund darf max. 300 Zeichen lang sein." };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Benutzer nicht gefunden." };
  if (target.role === "admin") return { error: "Owner können keine Verwarnung erhalten." };

  await prisma.warning.create({
    data: { reason: trimmed, userId, issuedBy: session.user.name },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteWarning(warningId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) return { error: "Nicht angemeldet." };
  if (session.user.role !== "admin") return { error: "Keine Berechtigung." };

  await prisma.warning.delete({ where: { id: warningId } });
  revalidatePath("/admin");
  return { success: true };
}
