"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, Plus, Globe, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Show {
  id: string;
  name: string;
  dj: string;
  time: string;
  type: "live" | "weekly" | "daily" | "monthly";
  order: number;
}

const TYPE_LABELS: Record<string, string> = {
  live: "● Live",
  weekly: "Wöchentlich",
  daily: "Täglich",
  monthly: "Monatlich",
};

export function WebsiteShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [dj, setDj] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"live" | "weekly" | "daily" | "monthly">("live");

  useEffect(() => {
    const q = query(collection(db, "shows"), orderBy("order"));
    const unsub = onSnapshot(q, (snap) => {
      setShows(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Show)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleAdd() {
    if (!name.trim() || !dj.trim() || !time.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "shows"), {
      name: name.trim().toUpperCase(),
      dj: dj.trim(),
      time: time.trim(),
      type,
      order: Date.now(),
    });
    setName(""); setDj(""); setTime(""); setType("live");
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Sendung wirklich löschen?")) return;
    await deleteDoc(doc(db, "shows", id));
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary-600" />
          <CardTitle className="text-base">Sendungen auf der Website</CardTitle>
        </div>
        <p className="text-xs font-jakarta text-slate-400 mt-1">
          Hier eingetragene Sendungen erscheinen sofort live auf blacklion-consulting.de
        </p>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Sendungsname</label>
            <input
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="z.B. MORNING BEATS"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">DJ / Host</label>
            <input
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="z.B. Marius"
              value={dj}
              onChange={(e) => setDj(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Tag & Uhrzeit</label>
            <input
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="z.B. Mo–Fr 07–10 Uhr"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Typ</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="live">● Live</option>
              <option value="weekly">Wöchentlich</option>
              <option value="daily">Täglich</option>
              <option value="monthly">Monatlich</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              onClick={handleAdd}
              disabled={saving || !name || !dj || !time}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Sendung hinzufügen
            </button>
            {success && (
              <span className="text-sm text-green-600 font-medium">✓ Gespeichert — jetzt live!</span>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Lädt…</span>
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
            Noch keine Sendungen eingetragen.
          </div>
        ) : (
          <div className="space-y-2">
            {shows.map((show, i) => (
              <div
                key={show.id}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <span className="text-xs font-mono text-slate-400 w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900">{show.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{show.dj} · {show.time}</p>
                </div>
                <Badge variant={show.type === "live" ? "default" : "secondary"} className="text-[10px] shrink-0">
                  {TYPE_LABELS[show.type] || show.type}
                </Badge>
                <button
                  onClick={() => handleDelete(show.id)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
