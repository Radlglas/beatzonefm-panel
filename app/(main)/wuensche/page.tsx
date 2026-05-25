"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, Heart, Music2, MessageSquare, Loader2, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Greeting {
  id: string;
  senderName: string;
  message: string;
  songRequest?: string | null;
  isRead: boolean;
  createdAt?: { seconds: number };
}

function formatTime(ts?: { seconds: number }) {
  if (!ts) return "";
  return new Date(ts.seconds * 1000).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WuenschePage() {
  const [items,   setItems]   = useState<Greeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "greetings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as Greeting))
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleMarkRead(id: string) {
    await updateDoc(doc(db, "greetings", id), { isRead: true });
  }

  async function handleDelete(id: string) {
    if (!confirm("Eintrag löschen?")) return;
    await deleteDoc(doc(db, "greetings", id));
  }

  const unread = items.filter((g) => !g.isRead).length;

  return (
    <div className="space-y-5 max-w-2xl animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="font-syne text-xl font-bold text-slate-900 tracking-tight">
            Grüße &amp; Wünsche
          </h2>
          <p className="text-xs font-jakarta text-slate-400 mt-0.5">
            Eingegangen über die Website — live für euch
          </p>
        </div>
        {!loading && (
          <div className="ml-auto flex items-center gap-2">
            {unread > 0 && (
              <Badge className="text-xs bg-red-500 hover:bg-red-500">
                {unread} neu
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {items.length} {items.length === 1 ? "Eintrag" : "Einträge"}
            </Badge>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm font-jakarta">Lädt…</span>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-jakarta text-slate-400">
              Noch keine Grüße eingegangen.
            </p>
            <p className="text-xs font-jakarta text-slate-300 mt-1">
              Sobald jemand ein Formular auf der Website abschickt, erscheint es hier.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((g) => (
            <Card
              key={g.id}
              className={`hover:shadow-card-hover transition-shadow ${!g.isRead ? "border-primary-200 bg-primary-50/30" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5 relative">
                    {!g.isRead && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                    )}
                    <span className="text-sm font-bold font-syne text-primary-600">
                      {g.senderName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold font-jakarta text-slate-900 text-sm">
                        {g.senderName}
                      </p>
                      {g.createdAt && (
                        <span className="text-[11px] font-jakarta text-slate-400">
                          {formatTime(g.createdAt)}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    {g.message && (
                      <div className="flex items-start gap-1.5 mt-2">
                        <MessageSquare className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-sm font-jakarta text-slate-600 leading-relaxed">
                          {g.message}
                        </p>
                      </div>
                    )}

                    {/* Song wish */}
                    {g.songRequest && (
                      <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 bg-primary-50 rounded-lg w-fit">
                        <Music2 className="w-3 h-3 text-primary-500 shrink-0" />
                        <span className="text-xs font-jakarta font-medium text-primary-700">
                          {g.songRequest}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!g.isRead && (
                      <button
                        onClick={() => handleMarkRead(g.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 transition-all"
                        title="Als gelesen markieren"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
