import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ShieldCheck } from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  Verhalten: "🤝",
  Organisation: "📋",
  Sicherheit: "🔒",
  Moderation: "🎙️",
  Musik: "🎵",
  Sendetechnik: "📡",
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Verhalten: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  Organisation: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  Sicherheit: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  Moderation: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  Musik: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  Sendetechnik: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" },
};

export default async function RegelnPage() {
  const rules = await prisma.rule.findMany({
    orderBy: { order: "asc" },
  });

  const categories = Array.from(new Set(rules.map((r) => r.category)));

  return (
    <div className="space-y-6 max-w-3xl animate-fade-up">
      <div>
        <h2 className="font-syne text-xl font-bold text-slate-900 tracking-tight">Regeln & Richtlinien</h2>
        <p className="text-xs font-jakarta text-slate-400 mt-0.5">
          Verbindliche Verhaltensregeln für alle Moderatorinnen und Moderatoren
        </p>
      </div>

      {/* Info card */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold font-syne text-primary-800">Verbindliche Regeln</p>
          <p className="text-xs font-jakarta text-primary-700 mt-0.5 leading-relaxed">
            Alle §§ entstammen den offiziellen <strong>Internen Regeln – BeatZone FM Team</strong>.
            Sie gelten für alle Teammitglieder verbindlich. Verstöße führen zu Gespräch, Verwarnung oder Teamausschluss.
            🎙 Wir sind ein Team – let&apos;s keep it that way.
          </p>
        </div>
      </div>

      {rules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-syne font-semibold text-slate-600">Keine Regeln vorhanden</p>
          </CardContent>
        </Card>
      )}

      {/* Grouped by category */}
      {categories.map((cat) => {
        const catRules = rules.filter((r) => r.category === cat);
        const colors = CATEGORY_COLORS[cat] || { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" };
        const icon = CATEGORY_ICONS[cat] || "📋";

        return (
          <div key={cat} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">{icon}</span>
              <h3 className="font-syne font-semibold text-slate-800">{cat}</h3>
            </div>

            <div className="space-y-3">
              {catRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-5 animate-fade-up`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-syne shrink-0 mt-0.5 ${colors.text} bg-white border ${colors.border}`}>
                      {rule.order}
                    </div>
                    <div>
                      <h4 className={`font-syne font-semibold text-sm ${colors.text} mb-1`}>{rule.title}</h4>
                      <p className="text-sm font-jakarta text-slate-600 leading-relaxed">{rule.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
