import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate, getInitials, DAYS_DE } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Radio, AlertTriangle } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin:     "Owner",
  moderator: "Radio Moderator",
  dj:        "DJ",
};

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { name: session.user.name },
    include: {
      shows:    { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      warnings: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-xl animate-fade-up">
      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="text-xl font-bold">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-syne font-bold text-xl text-slate-900 tracking-tight">{user.name}</h2>
              <Badge
                variant={user.role === "admin" ? "default" : user.role === "dj" ? "warning" : "secondary"}
                className="mt-1.5"
              >
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-jakarta text-slate-400">
                <CalendarDays className="w-3.5 h-3.5" />
                Dabei seit {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shows */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary-600" />
            <CardTitle>Meine Sendungen</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {user.shows.length === 0 ? (
            <div className="text-center py-8">
              <Radio className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-jakarta text-slate-400">
                Du hast noch keine Sendungen eingetragen.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {user.shows.map((show) => (
                <div
                  key={show.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="w-1 h-9 rounded-full shrink-0" style={{ backgroundColor: show.color }} />
                  <div>
                    <p className="text-sm font-semibold font-jakarta text-slate-900">{show.title}</p>
                    <p className="text-xs font-jakarta text-slate-400">
                      {DAYS_DE[show.dayOfWeek]} · {show.startTime} – {show.endTime} Uhr
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warnings */}
      {user.warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-amber-800">
                Verwarnungen ({user.warnings.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {user.warnings.map((w) => (
              <div
                key={w.id}
                className="rounded-lg border border-amber-200 bg-white px-4 py-3"
              >
                <p className="text-sm font-jakarta font-medium text-slate-800 leading-snug">{w.reason}</p>
                <p className="text-[11px] font-jakarta text-amber-600 mt-1">
                  Von {w.issuedBy} · {formatDate(w.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-xs font-jakarta text-slate-400 text-center">
        Passwort ändern? Wende dich an einen Owner.
      </p>
    </div>
  );
}
