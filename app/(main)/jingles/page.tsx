import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music2, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_COLORS: Record<string, string> = {
  Opener: "bg-purple-100 text-purple-700",
  "Station ID": "bg-blue-100 text-blue-700",
  Übergabe: "bg-emerald-100 text-emerald-700",
  Werbung: "bg-amber-100 text-amber-700",
  Outro: "bg-red-100 text-red-700",
  Sonstiges: "bg-slate-100 text-slate-700",
};

export default async function JinglesPage() {
  const jingles = await prisma.jingle.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  const categories = Array.from(new Set(jingles.map((j) => j.category)));

  return (
    <div className="space-y-6 max-w-4xl animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-syne text-xl font-bold text-slate-900 tracking-tight">Jingle-Bibliothek</h2>
          <p className="text-xs font-jakarta text-slate-400 mt-0.5">{jingles.length} Jingles verfügbar</p>
        </div>
      </div>

      {jingles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Music2 className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-syne font-semibold text-slate-600">Keine Jingles vorhanden</p>
            <p className="text-xs font-jakarta text-slate-400 mt-1">Jingles werden hier angezeigt, sobald sie hinzugefügt wurden.</p>
          </CardContent>
        </Card>
      )}

      {categories.map((cat) => {
        const catJingles = jingles.filter((j) => j.category === cat);
        return (
          <div key={cat} className="space-y-3">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-slate-400" />
              <h3 className="font-syne font-semibold text-sm text-slate-700">{cat}</h3>
              <span className="text-xs font-jakarta text-slate-400">({catJingles.length})</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {catJingles.map((jingle) => (
                <div
                  key={jingle.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-card hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                      <Music2 className="w-5 h-5 text-primary-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold font-jakarta text-slate-900 text-sm truncate">{jingle.title}</p>
                      {jingle.description && (
                        <p className="text-xs font-jakarta text-slate-500 mt-0.5 truncate">{jingle.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold font-jakarta ${
                            CATEGORY_COLORS[jingle.category] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {jingle.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-jakarta text-slate-400">
                          <Clock className="w-3 h-3" />
                          {jingle.duration}
                        </div>
                      </div>
                      {jingle.tags && (
                        <div className="flex gap-1 flex-wrap mt-1.5">
                          {jingle.tags.split(",").filter(Boolean).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-jakarta text-slate-500"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-3.5 w-3.5 text-primary-600" />
                    </Button>
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
