"use client";

import { useState, useTransition } from "react";
import { createShow, deleteShow } from "@/app/actions/show";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DAYS_DE } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

const COLORS = [
  "#7c3aed", "#2563eb", "#059669", "#dc2626",
  "#d97706", "#db2777", "#0891b2", "#65a30d",
];

export type ShowItem = {
  id: number;
  title: string;
  description: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  color: string;
  moderator: { name: string };
};

export function ShowActions({
  shows,
  userName,
  userRole,
}: {
  shows: ShowItem[];
  userName: string;
  userRole: string;
}) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState("#7c3aed");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("color", color);
    setError("");
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await createShow(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setColor("#7c3aed");
        form.reset();
      }
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Sendung wirklich löschen?")) return;
    startTransition(async () => {
      await deleteShow(id);
    });
  }

  return (
    <div className="space-y-4">
      {/* Create button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-jakarta font-semibold rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all"
      >
        <Plus className="w-4 h-4" />
        Sendung eintragen
      </button>

      {/* Show list */}
      <div>
        <h3 className="font-syne font-semibold text-sm text-slate-700 mb-3">Alle Sendungen</h3>
        {shows.length === 0 && (
          <p className="text-sm font-jakarta text-slate-400">Noch keine Sendungen eingetragen.</p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {shows.map((show) => {
            const canDelete = userRole === "admin" || show.moderator.name === userName;
            return (
              <div
                key={show.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div
                  className="w-1 h-12 rounded-full shrink-0"
                  style={{ backgroundColor: show.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold font-jakarta text-slate-900 text-sm">
                    {show.title}
                  </p>
                  <p className="text-xs font-jakarta text-slate-400 mt-0.5">
                    {DAYS_DE[show.dayOfWeek]} · {show.startTime} – {show.endTime} Uhr
                  </p>
                  {show.description && (
                    <p className="text-xs font-jakarta text-slate-500 mt-1 truncate">
                      {show.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {show.moderator.name}
                  </Badge>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(show.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Sendung löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sendung eintragen</DialogTitle>
            <DialogDescription>
              Füge deine Sendung zum Wochenplan hinzu. Pflichtfelder sind mit * markiert.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 mt-1">
            {/* Title */}
            <div>
              <label className="block text-sm font-jakarta font-medium text-slate-700 mb-1.5">
                Titel *
              </label>
              <input
                name="title"
                required
                placeholder="z. B. Morning Vibes"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-jakarta text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Day */}
            <div>
              <label className="block text-sm font-jakarta font-medium text-slate-700 mb-1.5">
                Wochentag *
              </label>
              <select
                name="dayOfWeek"
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-jakarta text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
              >
                {DAYS_DE.map((day, i) => (
                  <option key={i} value={i}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Start + End time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-jakarta font-medium text-slate-700 mb-1.5">
                  Startzeit *
                </label>
                <input
                  name="startTime"
                  type="time"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-jakarta text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-jakarta font-medium text-slate-700 mb-1.5">
                  Endzeit *
                </label>
                <input
                  name="endTime"
                  type="time"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-jakarta text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Color swatches */}
            <div>
              <label className="block text-sm font-jakarta font-medium text-slate-700 mb-2">
                Farbe
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? `3px solid ${c}` : "3px solid transparent",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-jakarta font-medium text-slate-700 mb-1.5">
                Beschreibung{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Kurze Beschreibung der Sendung…"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-jakarta text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm font-jakarta text-red-600 bg-red-50 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(""); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-jakarta font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white text-sm font-jakarta font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors"
              >
                {isPending ? "Wird gespeichert…" : "Sendung speichern"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
