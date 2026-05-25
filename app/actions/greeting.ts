"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** Public — no auth needed (listeners submit from /gruss) */
export async function createGreeting(formData: FormData) {
  const senderName  = (formData.get("senderName") as string)?.trim();
  const message     = (formData.get("message")    as string)?.trim();
  const songRequest = (formData.get("songRequest") as string)?.trim() || null;

  if (!senderName) return { error: "Bitte deinen Namen angeben." };
  if (!message)    return { error: "Bitte eine Nachricht schreiben." };
  if (senderName.length > 60)  return { error: "Name zu lang (max. 60 Zeichen)." };
  if (message.length > 500)    return { error: "Nachricht zu lang (max. 500 Zeichen)." };

  await prisma.greeting.create({
    data: { senderName, message, songRequest },
  });

  return { success: true };
}

/** Mark a single greeting as read — auth required */
export async function markGreetingRead(id: number) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Nicht angemeldet." };

  await prisma.greeting.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/");
  return { success: true };
}

/** Delete a greeting — auth required */
export async function deleteGreeting(id: number) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Nicht angemeldet." };

  await prisma.greeting.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}

/** Mark all unread greetings as read — auth required */
export async function markAllGreetingsRead() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Nicht angemeldet." };

  await prisma.greeting.updateMany({ where: { isRead: false }, data: { isRead: true } });
  revalidatePath("/");
  return { success: true };
}
