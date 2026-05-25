"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

async function ensureSettings() {
  return prisma.studioSettings.upsert({
    where:  { id: 1 },
    create: { id: 1, greetingsOpen: false, songRequestsOpen: false },
    update: {},
  });
}

/** Sync the current Prisma settings to Firebase so website.html can read them */
async function syncToFirebase(greetingsOpen: boolean, songRequestsOpen: boolean) {
  try {
    await setDoc(
      doc(db, "settings", "studio"),
      { greetingsOpen, songRequestsOpen },
      { merge: true }
    );
  } catch {
    // Non-fatal — the Radio Panel still works via Prisma
  }
}

export async function getStudioSettings() {
  return ensureSettings();
}

export async function toggleGreetings() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Nicht angemeldet." };

  const current  = await ensureSettings();
  const newValue = !current.greetingsOpen;

  await prisma.studioSettings.update({
    where: { id: 1 },
    data:  { greetingsOpen: newValue },
  });

  // Keep Firebase in sync so website.html respects the toggle
  await syncToFirebase(newValue, current.songRequestsOpen);

  revalidatePath("/onair");
  revalidatePath("/gruss");
  return { success: true };
}

export async function toggleSongRequests() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Nicht angemeldet." };

  const current  = await ensureSettings();
  const newValue = !current.songRequestsOpen;

  await prisma.studioSettings.update({
    where: { id: 1 },
    data:  { songRequestsOpen: newValue },
  });

  // Keep Firebase in sync
  await syncToFirebase(current.greetingsOpen, newValue);

  revalidatePath("/onair");
  revalidatePath("/gruss");
  return { success: true };
}
