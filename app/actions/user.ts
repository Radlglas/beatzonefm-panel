"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  const name     = (formData.get("name") as string)?.trim();
  const password = formData.get("password") as string;
  const role     = formData.get("role") as string;

  if (!name || !password || !role) {
    return { error: "Alle Felder ausfüllen." };
  }
  if (name.length < 2) {
    return { error: "Benutzername muss mindestens 2 Zeichen lang sein." };
  }
  if (password.length < 6) {
    return { error: "Passwort muss mindestens 6 Zeichen lang sein." };
  }

  const existing = await prisma.user.findUnique({ where: { name } });
  if (existing) {
    return { error: `Benutzername „${name}" ist bereits vergeben.` };
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, password: hashed, role },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUser(id: number) {
  // Prevent deleting owners
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: "Benutzer nicht gefunden." };
  if (user.role === "admin") return { error: "Owner können nicht gelöscht werden." };

  await prisma.show.deleteMany({ where: { moderatorId: id } });
  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin");
  return { success: true };
}
