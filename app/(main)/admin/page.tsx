import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Radio, CalendarDays, UserPlus, Trash2 } from "lucide-react";
import { AddUserForm } from "./add-user-form";
import { WarnUserButton } from "./warn-user-button";
import { deleteUser } from "@/app/actions/user";

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  admin:     { label: "Owner",     variant: "default" },
  moderator: { label: "Moderator", variant: "secondary" },
  dj:        { label: "DJ",        variant: "warning" },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    include: { shows: true, warnings: { orderBy: { createdAt: "desc" } } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const totalShows   = await prisma.show.count();
  const totalDocs    = await prisma.document.count();
  const totalJingles = await prisma.jingle.count();

  async function handleDelete(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    await deleteUser(id);
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="font-syne text-xl font-bold text-slate-900 tracking-tight">Administration</h2>
          <p className="text-xs font-jakarta text-slate-400 mt-0.5">Nur für Owner sichtbar</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Nutzer",    value: users.length },
          { label: "Sendungen", value: totalShows },
          { label: "Dokumente", value: totalDocs },
          { label: "Jingles",   value: totalJingles },
        ].map((s, i) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-card animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <p className="text-xs font-jakarta text-slate-400">{s.label}</p>
            <p className="font-syne text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add user */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary-600" />
            <CardTitle>Benutzer hinzufügen</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <AddUserForm />
        </CardContent>
      </Card>

      {/* User list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              <CardTitle>Alle Benutzer</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">{users.length} Nutzer</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((user) => {
            const roleInfo = ROLE_LABELS[user.role] || { label: user.role, variant: "secondary" as const };
            const isOwner  = user.role === "admin";

            // Serialize warnings (strip Date objects)
            const warnings = user.warnings.map((w) => ({
              id:        w.id,
              reason:    w.reason,
              issuedBy:  w.issuedBy,
              createdAt: w.createdAt.toISOString(),
            }));

            return (
              <div
                key={user.id}
                className="py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                {/* Top row: avatar + info + actions */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold font-jakarta text-slate-900">{user.name}</p>
                      <Badge variant={roleInfo.variant} className="text-[10px]">{roleInfo.label}</Badge>
                      {warnings.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-jakarta text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          ⚠ {warnings.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <div className="flex items-center gap-1 text-[11px] font-jakarta text-slate-400">
                        <Radio className="w-3 h-3" />
                        {user.shows.length} Sendung{user.shows.length !== 1 ? "en" : ""}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-jakarta text-slate-400">
                        <CalendarDays className="w-3 h-3" />
                        Seit {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Delete (not for owners) */}
                    {!isOwner && (
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={user.id} />
                        <button
                          type="submit"
                          title="Benutzer löschen"
                          className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Warn button + warning list (not for owners) */}
                {!isOwner && (
                  <div className="mt-2 pl-12">
                    <WarnUserButton
                      userId={user.id}
                      userName={user.name}
                      warnings={warnings}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
