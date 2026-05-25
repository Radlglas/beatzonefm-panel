"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useGreetings } from "@/hooks/use-greetings";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { MessageCircleHeart, Music2, Check, Trash2, CheckCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function GreetingsBox() {
  const { greetings, unreadCount, refresh } = useGreetings(20000);
  const [open, setOpen]     = useState(false);
  const [tab,  setTab]      = useState<"unread" | "all">("unread");
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await updateDoc(doc(db, "greetings", id), { isRead: true });
      refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteDoc(doc(db, "greetings", id));
      refresh();
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      const snap = await getDocs(
        query(collection(db, "greetings"), where("isRead", "==", false))
      );
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
        await batch.commit();
      }
      refresh();
    });
  }

  const displayed = tab === "unread"
    ? greetings.filter((g) => !g.isRead)
    : greetings;

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold font-jakarta transition-all",
          open
            ? "bg-primary-50 border-primary-200 text-primary-700"
            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white"
        )}
      >
        <MessageCircleHeart className="w-3.5 h-3.5" />
        <span>Grüße & Wünsche</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-syne font-bold text-sm text-slate-900">Grüße & Wünsche</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    disabled={isPending}
                    className="flex items-center gap-1 text-[11px] font-jakarta text-slate-400 hover:text-primary-600 transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Alle gelesen
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-0.5 text-slate-300 hover:text-slate-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {(["unread", "all"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 text-[11px] font-semibold font-jakarta py-1 rounded-md transition-all",
                    tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t === "unread" ? `Neu (${unreadCount})` : `Alle (${greetings.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
            {displayed.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                <MessageCircleHeart className="w-8 h-8 text-slate-200" />
                <p className="text-sm font-jakarta text-slate-400">
                  {tab === "unread" ? "Keine neuen Grüße" : "Noch keine Einsendungen"}
                </p>
                <p className="text-[11px] font-jakarta text-slate-300">
                  Einsendungen kommen via{" "}
                  <a
                    href="/gruss"
                    target="_blank"
                    className="text-primary-500 hover:underline"
                  >
                    /gruss
                  </a>
                </p>
              </div>
            )}

            {displayed.map((g) => (
              <div
                key={g.id}
                className={cn(
                  "px-4 py-3 transition-colors",
                  !g.isRead ? "bg-primary-50/40" : "bg-white"
                )}
              >
                {/* Sender + time */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {!g.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                    )}
                    <p className="text-xs font-bold font-jakarta text-slate-900">
                      {g.senderName}
                    </p>
                  </div>
                  <p className="text-[10px] font-jakarta text-slate-400">
                    {new Date(g.createdAt).toLocaleTimeString("de-DE", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                    {" · "}
                    {new Date(g.createdAt).toLocaleDateString("de-DE", {
                      day: "2-digit", month: "2-digit",
                    })}
                  </p>
                </div>

                {/* Message */}
                <p className="text-xs font-jakarta text-slate-700 leading-relaxed mb-1.5">
                  {g.message}
                </p>

                {/* Song request */}
                {g.songRequest && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 mb-2">
                    <Music2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <p className="text-[11px] font-semibold font-jakarta text-emerald-700 truncate">
                      {g.songRequest}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!g.isRead && (
                    <button
                      onClick={() => handleMarkRead(g.id)}
                      disabled={isPending}
                      className="flex items-center gap-1 text-[11px] font-jakarta text-slate-400 hover:text-primary-600 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Gelesen
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(g.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-[11px] font-jakarta text-slate-400 hover:text-red-500 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50">
            <p className="text-[11px] font-jakarta text-slate-400 text-center">
              Öffentliche Einsendeseite:{" "}
              <a
                href="/gruss"
                target="_blank"
                className="text-primary-500 hover:text-primary-700 font-semibold hover:underline"
              >
                /gruss
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
