import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_COLORS: Record<string, string> = {
  Technik: "bg-blue-100 text-blue-700",
  Organisation: "bg-purple-100 text-purple-700",
  Marketing: "bg-pink-100 text-pink-700",
  Rechtliches: "bg-amber-100 text-amber-700",
  Sonstiges: "bg-slate-100 text-slate-700",
};

export default async function DokumentePage() {
  const documents = await prisma.document.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  const categories = Array.from(new Set(documents.map((d) => d.category)));
  const grouped = categories.map((cat) => ({
    cat,
    docs: documents.filter((d) => d.category === cat),
  }));

  return (
    <div className="space-y-6 max-w-4xl animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-syne text-xl font-bold text-slate-900 tracking-tight">Dokumente</h2>
          <p className="text-xs font-jakarta text-slate-400 mt-0.5">{documents.length} Dateien verfügbar</p>
        </div>
      </div>

      {grouped.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-syne font-semibold text-slate-600">Keine Dokumente vorhanden</p>
            <p className="text-xs font-jakarta text-slate-400 mt-1">Dokumente werden hier angezeigt, sobald sie hochgeladen wurden.</p>
          </CardContent>
        </Card>
      )}

      {grouped.map(({ cat, docs }) => (
        <div key={cat} className="space-y-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-slate-400" />
            <h3 className="font-syne font-semibold text-sm text-slate-700">{cat}</h3>
            <span className="text-xs font-jakarta text-slate-400">({docs.length})</span>
          </div>

          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-slate-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold font-jakarta text-slate-900 text-sm">{doc.title}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold font-jakarta ${
                        CATEGORY_COLORS[doc.category] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {doc.category}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-xs font-jakarta text-slate-500 mt-0.5 truncate">{doc.description}</p>
                  )}
                  <p className="text-[11px] font-jakarta text-slate-400 mt-1">
                    Hochgeladen von {doc.uploadedBy} · {formatDate(doc.uploadedAt)}
                    {doc.fileSize && ` · ${doc.fileSize}`}
                  </p>
                </div>

                <Button variant="ghost" size="icon" asChild className="shrink-0">
                  <a href={doc.fileUrl} download>
                    <Download className="h-4 w-4 text-slate-400" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
