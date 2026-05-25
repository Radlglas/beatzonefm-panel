import { prisma } from "@/lib/db";
import { formatDate, getInitials, DAYS_DE } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarDays, Shield, Radio } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "warning" }> = {
  admin:     { label: "Owner",     variant: "default" },
  moderator: { label: "Moderator", variant: "secondary" },
  dj:        { label: "DJ",        variant: "warning" },
};

export default async function TeamPage() {
  const users = await prisma.user.findMany({
    include: { shows: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const owners     = users.filter((u) => u.role === "admin");
  const moderators = users.filter((u) => u.role === "moderator");
  const djs        = users.filter((u) => u.role === "dj");

  const Section = ({
    title,
    icon: Icon,
    members,
    startIndex,
  }: {
    title: string;
    icon: React.ElementType;
    members: typeof users;
    startIndex: number;
  }) =>
    members.length === 0 ? null : (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <h3 className="font-syne font-semibold text-sm text-slate-700">{title}</h3>
          <span className="text-xs font-jakarta text-slate-400">({members.length})</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {members.map((user, i) => {
            const roleInfo = ROLE_LABELS[user.role] || { label: user.role, variant: "secondary" as const };
            return (
              <Card
                key={user.id}
                className="animate-fade-up hover:shadow-card-hover transition-shadow"
                style={{ animationDelay: `${(startIndex + i) * 0.06}s` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarFallback className="text-sm font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-syne font-bold text-slate-900 text-sm">{user.name}</h4>
                        <Badge variant={roleInfo.variant} className="text-[10px]">
                          {roleInfo.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 text-[11px] font-jakarta text-slate-400">
                          <Radio className="w-3 h-3 shrink-0" />
                          {user.shows.length} Sendung{user.shows.length !== 1 ? "en" : ""}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-jakarta text-slate-400">
                          <CalendarDays className="w-3 h-3 shrink-0" />
                          Seit {formatDate(user.createdAt)}
                        </div>
                      </div>

                      {user.shows.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {user.shows.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-jakarta font-medium"
                              style={{ backgroundColor: s.color + "22", color: s.color }}
                            >
                              {s.title} · {DAYS_DE[s.dayOfWeek]}
                            </span>
                          ))}
                          {user.shows.length > 3 && (
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-jakarta text-slate-500">
                              +{user.shows.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    );

  return (
    <div className="space-y-8 max-w-4xl animate-fade-up">
      <div>
        <h2 className="font-syne text-xl font-bold text-slate-900 tracking-tight">Das Team</h2>
        <p className="text-xs font-jakarta text-slate-400 mt-0.5">
          {users.length} Mitglieder insgesamt
        </p>
      </div>

      <Section title="Owner" icon={Shield} members={owners} startIndex={0} />
      <Section title="Moderatoren" icon={Users} members={moderators} startIndex={owners.length} />
      <Section title="DJs" icon={Radio} members={djs} startIndex={owners.length + moderators.length} />
    </div>
  );
}
