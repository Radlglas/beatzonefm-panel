"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { Radio, MessageCircleHeart, Music2, CheckCircle2, Lock } from "lucide-react";

type Settings = { greetingsOpen: boolean; songRequestsOpen: boolean };

export default function GrussPage() {
  const [settings,  setSettings]  = useState<Settings | null>(null);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");
  const [sending,   setSending]   = useState(false);

  // Read open/closed status from Radio Panel settings API
  useEffect(() => {
    fetch("/api/studio-settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => setSettings({ greetingsOpen: false, songRequestsOpen: false }));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);

    const fd          = new FormData(e.currentTarget);
    const senderName  = (fd.get("senderName")  as string)?.trim();
    const message     = (fd.get("message")     as string)?.trim();
    const songRequest = (fd.get("songRequest") as string)?.trim() || null;

    if (!senderName) { setError("Bitte deinen Namen angeben."); setSending(false); return; }
    if (!message)    { setError("Bitte eine Nachricht schreiben."); setSending(false); return; }
    if (senderName.length > 60)  { setError("Name zu lang (max. 60 Zeichen)."); setSending(false); return; }
    if (message.length > 500)    { setError("Nachricht zu lang (max. 500 Zeichen)."); setSending(false); return; }

    try {
      await addDoc(collection(db, "greetings"), {
        senderName,
        message,
        songRequest,
        isRead:    false,
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch {
      setError("Fehler beim Senden. Bitte versuche es nochmal.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 60%), linear-gradient(to bottom right, #0f172a, #1e1b4b, #0f172a)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg mb-4"
            style={{ boxShadow: "0 12px 32px rgba(124,58,237,0.5)" }}>
            <Radio className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-syne font-bold text-2xl text-white tracking-tight">BeatZone FM</h1>
          <p className="text-sm font-jakarta text-white/50 mt-1">Grüße & Wünsche ans Studio</p>
        </div>

        {/* Loading */}
        {settings === null && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Box closed */}
        {settings !== null && !settings.greetingsOpen && (
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-white/50" />
            </div>
            <div>
              <h2 className="font-syne font-bold text-xl text-white mb-2">Wunschbox geschlossen</h2>
              <p className="font-jakarta text-white/50 text-sm leading-relaxed">
                Die Grüße- und Wunschbox ist momentan deaktiviert.<br />
                Schau später wieder vorbei!
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {settings?.greetingsOpen && done && (
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <div>
              <h2 className="font-syne font-bold text-xl text-white mb-2">Danke!</h2>
              <p className="font-jakarta text-white/60 text-sm leading-relaxed">
                Dein Gruß wurde ans Studio weitergeleitet. Vielleicht hörst du deinen Namen bald im Radio! 🎙️
              </p>
            </div>
            <button onClick={() => setDone(false)}
              className="mt-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-jakarta font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Noch einen senden
            </button>
          </div>
        )}

        {/* Form — only when open */}
        {settings?.greetingsOpen && !done && (
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageCircleHeart className="w-5 h-5 text-primary-400" />
              <h2 className="font-syne font-bold text-white text-lg">Schreib uns!</h2>
              {/* Open indicator */}
              <span className="ml-auto flex items-center gap-1 text-[10px] font-bold font-syne text-emerald-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Live offen
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-jakarta font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                  Dein Name *
                </label>
                <input name="senderName" required maxLength={60} placeholder="z. B. Max aus Köln"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-jakarta text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-jakarta font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                  Gruß / Nachricht *
                </label>
                <textarea name="message" required maxLength={500} rows={4}
                  placeholder="Hallo an alle, schöne Grüße aus München! 🎶"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-jakarta text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" />
              </div>

              {settings.songRequestsOpen && (
                <div>
                  <label className="block text-xs font-jakarta font-semibold text-white/60 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Music2 className="w-3 h-3" />
                    Songwunsch <span className="font-normal normal-case tracking-normal text-white/30">(optional)</span>
                  </label>
                  <input name="songRequest" maxLength={150} placeholder="z. B. Stromae – Papaoutai"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-jakarta text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
                </div>
              )}

              {error && (
                <p className="text-sm font-jakarta text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button type="submit" disabled={sending}
                className="w-full py-3 bg-primary-600 text-white font-jakarta font-bold text-sm rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors active:scale-[0.98] mt-2"
                style={{ boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
                {sending ? "Wird gesendet…" : "Gruß absenden 🎙️"}
              </button>
            </form>

            <p className="text-center text-[11px] font-jakarta text-white/25 mt-5">
              Grüße erscheinen live im Studio-Panel der Moderatoren.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
