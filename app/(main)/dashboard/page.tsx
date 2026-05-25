import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DAYS_DE, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Music2, FileText, Clock, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [userCount, showCount, jingleCount, docCount, nextShows, myShows] = await Promise.all([
    prisma.user.count(),
    prisma.show.count(),
    prisma.jingle.count(),
    prisma.document.count(),
    prisma.show.findMany({
      include: { moderator: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
    prisma.show.findMany({
      where: { moderator: { name: session?.user?.name || "" } },
      include: { moderator: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  const stats = [
    { label: "Moderatoren", value: userCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Sendungen / Woche", value: showCount, icon: CalendarDays, color: "text-primary-600", bg: "bg-primary-50" },
    { label: "Jingles", value: jingleCount, icon: Music2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Dokumente", value: docCount, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7; // Convert: 0=Mon

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div className="animate-fade-up">
        <h2 className="font-syne text-2xl font-bold text-slate-900 tracking-tight">
          Hallo, {session?.user?.name} 👋
        </h2>
        <p className="text-sm font-jakarta text-slate-500 mt-1">
          {formatDate(today)} · Hier ist deine Übersicht für heute
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={`animate-fade-up animate-fade-up-${i + 1}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-jakarta font-medium text-slate-500 mb-1">{s.label}</p>
                    <p className="font-syne text-3xl font-bold text-slate-900">{s.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next shows */}
        <Card className="animate-fade-up animate-fade-up-3">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" />
              <CardTitle>Nächste Sendungen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextShows.length === 0 && (
              <p className="text-sm font-jakarta text-slate-400">Keine Sendungen geplant.</p>
            )}
            {nextShows.map((show) => (
              <div key={show.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <div
                  className="w-1 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: show.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold font-jakarta text-slate-900 truncate">{show.title}</p>
                  <p className="text-xs font-jakarta text-slate-400">
                    {DAYS_DE[show.dayOfWeek]} · {show.startTime} – {show.endTime} Uhr
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {show.moderator.name}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My shows */}
        <Card className="animate-fade-up animate-fade-up-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              <CardTitle>Meine Sendungen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {myShows.length === 0 && (
              <p className="text-sm font-jakarta text-slate-400">
                Du hast noch keine Sendungen eingetragen.
              </p>
            )}
            {myShows.map((show) => {
              const isToday = show.dayOfWeek === todayDow;
              return (
                <div key={show.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: show.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-jakarta text-slate-900 truncate">{show.title}</p>
                    <p className="text-xs font-jakarta text-slate-400">
                      {DAYS_DE[show.dayOfWeek]} · {show.startTime} – {show.endTime} Uhr
                    </p>
                  </div>
                  {isToday && (
                    <Badge className="text-xs shrink-0 bg-emerald-100 text-emerald-700">Heute</Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
