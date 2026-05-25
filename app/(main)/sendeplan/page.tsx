import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DAYS_DE, DAYS_SHORT } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { WebsiteShows } from "./website-shows";
import { ShowActions, type ShowItem } from "./show-actions";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 – 22:00

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToPx(minutes: number, startHour = 6) {
  return ((minutes - startHour * 60) / 60) * 56; // 56px per hour
}

export default async function SendeplanPage() {
  const [session, rawShows] = await Promise.all([
    getServerSession(authOptions),
    prisma.show.findMany({
      include: { moderator: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  // Serialize shows (strip Date objects for client component)
  const shows: ShowItem[] = rawShows.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    color: s.color,
    moderator: { name: s.moderator.name },
  }));

  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7;

  const showsByDay = DAYS_DE.map((_, i) => shows.filter((s) => s.dayOfWeek === i));

  const userName = session?.user?.name ?? "";
  const userRole = (session?.user as { role?: string })?.role ?? "moderator";

  return (
    <div className="space-y-5 max-w-full animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-syne text-xl font-bold text-slate-900 tracking-tight">Wochenplan</h2>
          <p className="text-xs font-jakarta text-slate-400 mt-0.5">Alle geplanten Sendungen im Überblick</p>
        </div>
      </div>

      {/* Legend */}
      {shows.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Array.from(new Set(shows.map((s) => s.moderator.name))).map((name) => {
            const show = shows.find((s) => s.moderator.name === name)!;
            return (
              <div key={name} className="flex items-center gap-1.5 text-xs font-jakarta text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: show.color }} />
                {name}
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header: days */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}>
              <div className="border-r border-slate-200" />
              {DAYS_DE.map((day, i) => (
                <div
                  key={day}
                  className={`px-3 py-3 text-center border-r border-slate-200 last:border-r-0 ${
                    i === todayDow ? "bg-primary-50" : ""
                  }`}
                >
                  <p className={`text-xs font-semibold font-syne ${i === todayDow ? "text-primary-600" : "text-slate-500"}`}>
                    {DAYS_SHORT[i]}
                  </p>
                  {i === todayDow && (
                    <div className="w-1 h-1 bg-primary-600 rounded-full mx-auto mt-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Grid body */}
            <div className="relative grid" style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}>
              {/* Time labels */}
              <div className="border-r border-slate-200">
                {HOURS.map((h) => (
                  <div key={h} className="h-14 flex items-start justify-end pr-2 pt-1">
                    <span className="text-[10px] font-jakarta text-slate-400">{String(h).padStart(2, "0")}:00</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {showsByDay.map((dayShows, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`relative border-r border-slate-200 last:border-r-0 ${
                    dayIdx === todayDow ? "bg-primary-50/30" : ""
                  }`}
                  style={{ height: `${HOURS.length * 56}px` }}
                >
                  {/* Hour lines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-slate-100"
                      style={{ top: `${(h - 6) * 56}px` }}
                    />
                  ))}

                  {/* Shows */}
                  {dayShows.map((show) => {
                    const startMin = timeToMinutes(show.startTime);
                    const endMin = timeToMinutes(show.endTime) || timeToMinutes("24:00");
                    const top = minutesToPx(startMin);
                    const height = Math.max(minutesToPx(endMin) - top, 20);

                    return (
                      <div
                        key={show.id}
                        className="absolute left-1 right-1 rounded-md px-2 py-1.5 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: show.color + "22",
                          borderLeft: `3px solid ${show.color}`,
                        }}
                        title={`${show.title} — ${show.startTime}–${show.endTime}`}
                      >
                        <p
                          className="text-[11px] font-semibold font-jakarta leading-tight truncate"
                          style={{ color: show.color }}
                        >
                          {show.title}
                        </p>
                        {height > 36 && (
                          <p className="text-[10px] font-jakarta text-slate-500 leading-none mt-0.5">
                            {show.startTime} – {show.endTime}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Actions: create button + show list with delete */}
      <ShowActions shows={shows} userName={userName} userRole={userRole} />

      {/* Website shows (Firebase) */}
      <WebsiteShows />
    </div>
  );
}
