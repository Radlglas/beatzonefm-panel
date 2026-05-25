"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createShow(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) return { error: "Nicht angemeldet." };

  const title       = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const dayOfWeek   = Number(formData.get("dayOfWeek"));
  const startTime   = formData.get("startTime") as string;
  const endTime     = formData.get("endTime") as string;
  const color       = (formData.get("color") as string) || "#7c3aed";

  if (!title) return { error: "Titel ist erforderlich." };
  if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6)
    return { error: "Ungültiger Wochentag." };
  if (!startTime || !endTime) return { error: "Bitte Start- und Endzeit angeben." };
  if (startTime >= endTime && endTime !== "00:00")
    return { error: "Endzeit muss nach Startzeit liegen." };

  const user = await prisma.user.findUnique({ where: { name: session.user.name } });
  if (!user) return { error: "Benutzer nicht gefunden." };

  await prisma.show.create({
    data: {
      title,
      description,
      dayOfWeek,
      startTime,
      endTime,
      color,
      moderatorId: user.id,
    },
  });

  revalidatePath("/sendeplan");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteShow(id: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) return { error: "Nicht angemeldet." };

  const show = await prisma.show.findUnique({
    include: { moderator: true },
    where: { id },
  });
  if (!show) return { error: "Sendung nicht gefunden." };

  const isOwner = session.user.role === "admin";
  const isCreator = show.moderator.name === session.user.name;
  if (!isOwner && !isCreator)
    return { error: "Keine Berechtigung." };

  await prisma.show.delete({ where: { id } });
  revalidatePath("/sendeplan");
  revalidatePath("/dashboard");
  return { success: true };
}
