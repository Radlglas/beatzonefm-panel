import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const settings = await prisma.studioSettings.findUnique({ where: { id: 1 } });
    return NextResponse.json({
      greetingsOpen:    settings?.greetingsOpen    ?? false,
      songRequestsOpen: settings?.songRequestsOpen ?? false,
    });
  } catch {
    return NextResponse.json({ greetingsOpen: false, songRequestsOpen: false });
  }
}
