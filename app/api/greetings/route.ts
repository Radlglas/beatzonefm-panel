import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const greetings = await prisma.greeting.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = greetings.filter((g) => !g.isRead).length;

  return NextResponse.json({
    greetings: greetings.map((g) => ({
      id:          g.id,
      senderName:  g.senderName,
      message:     g.message,
      songRequest: g.songRequest,
      isRead:      g.isRead,
      createdAt:   g.createdAt.toISOString(),
    })),
    unreadCount,
  });
}
