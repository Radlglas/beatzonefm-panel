"use client";

import { useState, useTransition } from "react";
import { createWarning, deleteWarning } from "@/app/actions/warning";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";

type Warning = {
  id: number;
  reason: string;
  issuedBy: string;
  createdAt: string; // ISO string (serialized)
};

export function WarnUserButton({
  userId,
  userName,
  warnings,
}: {
  userId: number;
  userName: string;
  warnings: Warning[];
}) {
  const [open,     setOpen]     = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reason,   setReason]   = useState("");
  const [error,    setError]    = useState("");
  const [isPending, startTransition] = useTransition();

  function handleWarn() {
    setError("");
    startTransition(async () => {
      const res = await createWarning(userId, reason);
      if (res?.error) {
        setError(res.error);
      } else {
        setReason("");
        setOpen(false);
      }
    });
  }

  function handleDelete(warnId: number) {
    startTransition(async () => {
      await deleteWarning(warnId);
    });
  }

  const count = warnings.length;

  return (
    <div className="flex flex-col gap-1">
      {/* Warning count + expand toggle */}
      {count > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-jakarta font-medium text-amber-600 hover:text-amber-700 transition-colors self-start"
        >
          <AlertTriangle className="w-3 h-3" />
          {count} Verwarnung{count !== 1 ? "en" : ""}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}

      {/* Expanded warning list */}
      {expanded && count > 0 && (
        <div className="mt-1 space-y-1.5 pl-1">
          {warnings.map((w) => (
            <div
              key={w.id}
              className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold font-jakarta text-amber-900 leading-snug">
                  {w.reason}
                </p>
                <p className="text-[10px] font-jakarta text-amber-600 mt-0.5">
                  Von {w.issuedBy} · {new Date(w.createdAt).toLocaleDateString("de-DE", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(w.id)}
                disabled={isPending}
                className="p-0.5 rounded text-amber-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 mt-0.5"
                title="Verwarnung löschen"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Warn button */}
      <button
        onClick={() => { setOpen(true); setError(""); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-jakarta font-semibold text-amber-600 border border-amber-200 hover:bg-amber-50 hover:border-amber-300 active:scale-[0.97] transition-all self-start"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Verwarnen
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setReason(""); setError(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Verwarnung für {userName}
            </DialogTitle>
            <DialogDescription>
              Gib einen Grund an. Der Benutzer kann Verwarnungen in seinem Profil einsehen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            <div>
              <label className="block text-sm font-jakarta font-medium text-slate-700 mb-1.5">
                Grund *
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="z. B. Sendung ohne Abmeldung verpasst…"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-jakarta text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              />
              <p className="text-[10px] font-jakarta text-slate-400 mt-1 text-right">
                {reason.length}/300
              </p>
            </div>

            {error && (
              <p className="text-sm font-jakarta text-red-600 bg-red-50 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setOpen(false); setReason(""); setError(""); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-jakarta font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleWarn}
                disabled={isPending || !reason.trim()}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white text-sm font-jakarta font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Wird gespeichert…" : "Verwarnung erteilen"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
