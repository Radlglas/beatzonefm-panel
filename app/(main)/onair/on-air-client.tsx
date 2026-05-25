"use client";

import { useState, useTransition, useOptimistic } from "react";
import { useNowPlaying } from "@/hooks/use-now-playing";
import { useGreetings } from "@/hooks/use-greetings";
import { toggleGreetings, toggleSongRequests } from "@/app/actions/studio";
import { markGreetingRead, deleteGreeting } from "@/app/actions/greeting";
import {
  Radio, Headphones, Music2, MessageCircleHeart, Mic2,
  Check, Trash2, Clock, Users, BarChart3, Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Toggle({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50",
        enabled ? "bg-emerald-500" : "bg-slate-300"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function ProgressBar({ elapsed, duration }: { elapsed: number; duration: number }) {
  const pct = duration > 0 ? Math.min((elapsed / duration) * 100, 100) : 0;
  return (
    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
      <div
        className="h-full bg-white/70 rounded-full transition-all duration-1000"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function OnAirClient({
  initialGreetingsOpen,
  initialSongRequestsOpen,
  userName,
}: {
  initialGreetingsOpen:    boolean;
  initialSongRequestsOpen: boolean;
  userName: string;
}) {
  const np      = useNowPlaying(8000);
  const { greetings, unreadCount, refresh } = useGreetings(10000);

  const [greetingsOpen,    setGreetingsOpen]    = useState(initialGreetingsOpen);
  const [songRequestsOpen, setSongRequestsOpen] = useState(initialSongRequestsOpen);
  const [isPending, startTransition] = useTransition();

  const song      = np?.now_playing?.song;
  const elapsed   = np?.now_playing?.elapsed   ?? 0;
  const duration  = np?.now_playing?.duration  ?? 0;
  const listeners = np?.listeners?.current     ?? 0;
  const history   = np?.song_history           ?? [];
  const isLive    = np?.live?.is_live          ?? false;
  const streamer  = np?.live?.streamer_name    ?? "";

  function handleToggleGreetings() {
    setGreetingsOpen((v) => !v);
    startTransition(async () => {
      await toggleGreetings();
    });
  }

  function handleToggleSongRequests() {
    setSongRequestsOpen((v) => !v);
    startTransition(async () => {
      await toggleSongRequests();
    });
  }

  function handleRead(id: number) {
    startTransition(async () => {
      await markGreetingRead(id);
      await refresh();
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteGreeting(id);
      await refresh();
    });
  }

  const pending   = greetings.filter((g) => !g.isRead);
  const songOnly  = greetings.filter((g) => g.songRequest && !g.isRead);

  return (
    <div className="space-y-5 max-w-6xl animate-fade-up">

      {/* ── HERO BANNER ── */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #4f1d96 60%, #3b0764 100%)",
          boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
        }}
      >
        {/* blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ background: "radial-gradient(circle, white, transparent)" }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Left: station info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="font-syne font-bold text-sm tracking-wider uppercase opacity-90">
                {isLive && streamer ? `Live · ${streamer}` : "On Air · BeatZone FM"}
              </span>
            </div>

            {song ? (
              <div className="flex items-center gap-4">
                {/* Art */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/20 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={song.art} alt="" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-syne font-bold text-xl leading-tight truncate">{song.title}</p>
                  <p className="text-white/70 font-jakarta text-sm mt-0.5 truncate">{song.artist}</p>
                  <div className="mt-2 space-y-1">
                    <ProgressBar elapsed={elapsed} duration={duration} />
                    <div className="flex justify-between text-[10px] text-white/50 font-jakarta">
                      <span>{fmt(elapsed)}</span>
                      <span>{fmt(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-white/50 font-jakarta text-sm">Lädt…</p>
            )}
          </div>

          {/* Right: stats */}
          <div className="flex sm:flex-col gap-3 sm:gap-2 sm:items-end shrink-0">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5">
              <Headphones className="w-4 h-4 text-white/70" />
              <div>
                <p className="font-syne font-bold text-2xl leading-none">{listeners}</p>
                <p className="text-[10px] text-white/50 font-jakarta">Zuhörer</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5">
              <MessageCircleHeart className="w-4 h-4 text-white/70" />
              <div>
                <p className="font-syne font-bold text-2xl leading-none">{unreadCount}</p>
                <p className="text-[10px] text-white/50 font-jakarta">Neue Grüße</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── LEFT: Steuerung + Grüße ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Toggle Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
            <h3 className="font-syne font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary-600" />
              Sendungssteuerung
            </h3>

            <div className="space-y-3">
              {/* Grüße & Wünsche toggle */}
              <div className={cn(
                "flex items-center justify-between rounded-xl border p-4 transition-colors",
                greetingsOpen ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center",
                    greetingsOpen ? "bg-emerald-100" : "bg-slate-100")}>
                    <MessageCircleHeart className={cn("w-4.5 h-4.5",
                      greetingsOpen ? "text-emerald-600" : "text-slate-400")} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-jakarta text-slate-900">Grüße & Wunschbox</p>
                    <p className={cn("text-xs font-jakarta",
                      greetingsOpen ? "text-emerald-600" : "text-slate-400")}>
                      {greetingsOpen ? "Aktiv – Hörer können Grüße senden" : "Deaktiviert"}
                    </p>
                  </div>
                </div>
                <Toggle enabled={greetingsOpen} onToggle={handleToggleGreetings} disabled={isPending} />
              </div>

              {/* Songwünsche toggle */}
              <div className={cn(
                "flex items-center justify-between rounded-xl border p-4 transition-colors",
                songRequestsOpen ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center",
                    songRequestsOpen ? "bg-emerald-100" : "bg-slate-100")}>
                    <Music2 className={cn("w-4.5 h-4.5",
                      songRequestsOpen ? "text-emerald-600" : "text-slate-400")} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-jakarta text-slate-900">Musikwünsche</p>
                    <p className={cn("text-xs font-jakarta",
                      songRequestsOpen ? "text-emerald-600" : "text-slate-400")}>
                      {songRequestsOpen ? "Aktiv – Hörer können Songs wünschen" : "Deaktiviert"}
                    </p>
                  </div>
                </div>
                <Toggle enabled={songRequestsOpen} onToggle={handleToggleSongRequests} disabled={isPending} />
              </div>
            </div>
          </div>

          {/* Pending Grüße */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-syne font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageCircleHeart className="w-4 h-4 text-primary-600" />
                Eingehende Grüße
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <a href="/gruss" target="_blank"
                className="text-[11px] font-jakarta text-primary-500 hover:text-primary-700 hover:underline">
                Einsendeseite ↗
              </a>
            </div>

            <div className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
              {pending.length === 0 ? (
                <div className="py-10 text-center">
                  <MessageCircleHeart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-jakarta text-slate-400">Keine neuen Grüße</p>
                </div>
              ) : pending.map((g) => (
                <div key={g.id} className="px-5 py-3 bg-primary-50/30 hover:bg-primary-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                        <p className="text-xs font-bold font-jakarta text-slate-900">{g.senderName}</p>
                        <span className="text-[10px] text-slate-400 font-jakarta">
                          {new Date(g.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs font-jakarta text-slate-700 leading-relaxed mb-1.5 pl-3">{g.message}</p>
                      {g.songRequest && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 ml-3 w-fit">
                          <Music2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <p className="text-[11px] font-semibold font-jakarta text-emerald-700">{g.songRequest}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleRead(g.id)} disabled={isPending}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                        title="Als gelesen markieren">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(g.id)} disabled={isPending}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Löschen">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Trackliste ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-syne font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                Zuletzt gespielt
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {history.length === 0 ? (
                <p className="text-sm font-jakarta text-slate-400 text-center py-8">Keine Verlaufsdaten</p>
              ) : history.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.song.art} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold font-jakarta text-slate-900 truncate">{item.song.title}</p>
                    <p className="text-[11px] font-jakarta text-slate-400 truncate">{item.song.artist}</p>
                  </div>
                  <span className="text-[10px] font-jakarta text-slate-300 shrink-0">
                    {new Date(item.played_at * 1000).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
            <h3 className="font-syne font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-600" />
              Statistiken
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Zuhörer jetzt",  value: String(listeners),                         icon: Headphones },
                { label: "Ungelesene Grüße", value: String(unreadCount),                     icon: MessageCircleHeart },
                { label: "Songwünsche",    value: String(songOnly.length),                   icon: Music2 },
                { label: "Stream",         value: np ? "Online" : "Verbinde…",               icon: Wifi },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2 text-xs font-jakarta text-slate-500">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    {label}
                  </div>
                  <span className="text-xs font-bold font-jakarta text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
