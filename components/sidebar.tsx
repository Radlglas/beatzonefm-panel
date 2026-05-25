"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  BookOpen,
  Music2,
  Users,
  User,
  Settings2,
  LogOut,
  Radio,
  ChevronRight,
  Play,
  Pause,
  Loader,
  Headphones,
  Heart,
  Bot,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNowPlaying } from "@/hooks/use-now-playing";

const STREAM_URL = "https://rp.cynoria.de/listen/beatzonefm/radio.mp3";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { href: "/sendeplan",  label: "Sendeplan",       icon: CalendarDays },
  { href: "/wuensche",   label: "Grüße & Wünsche", icon: Heart },
  { href: "/dokumente",  label: "Dokumente",       icon: FileText },
  { href: "/regeln",     label: "Regeln",          icon: BookOpen },
  { href: "/jingles",    label: "Jingles",         icon: Music2 },
  { href: "/team",       label: "Team",            icon: Users },
  { href: "/profil",     label: "Mein Profil",     icon: User },
  { href: "/discord",    label: "Discord Bot",     icon: Bot },
];

const adminItems = [
  { href: "/admin", label: "Administration", icon: Settings2 },
];

export function Sidebar() {
  const pathname   = usePathname();
  const { data: session } = useSession();
  const isAdmin    = session?.user?.role === "admin";
  const nowPlaying = useNowPlaying(15000);

  // Audio player
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const [playing,   setPlaying]   = useState(false);
  const [buffering, setBuffering] = useState(false);

  function togglePlay() {
    if (!audioRef.current) {
      audioRef.current = new Audio(STREAM_URL);
      audioRef.current.addEventListener("waiting", () => setBuffering(true));
      audioRef.current.addEventListener("playing", () => { setBuffering(false); setPlaying(true); });
      audioRef.current.addEventListener("pause",   () => setPlaying(false));
      audioRef.current.addEventListener("ended",   () => setPlaying(false));
      audioRef.current.addEventListener("error",   () => { setBuffering(false); setPlaying(false); });
    }

    if (playing) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
      setPlaying(false);
      setBuffering(false);
    } else {
      setBuffering(true);
      audioRef.current.play().catch(() => {
        setBuffering(false);
        setPlaying(false);
      });
    }
  }

  const song      = nowPlaying?.now_playing?.song;
  const listeners = nowPlaying?.listeners?.current ?? null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-syne font-bold text-slate-900 text-sm leading-tight tracking-tight">
              Radio Panel
            </p>
            <p className="text-[10px] font-jakarta text-slate-400 leading-none mt-0.5">
              Sender-Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <div className="mb-1 px-2 pb-1">
          <p className="text-[10px] font-semibold font-jakarta text-slate-400 uppercase tracking-widest">
            Navigation
          </p>
        </div>

        {navItems.map((item) => {
          const Icon     = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-jakarta font-medium transition-all duration-150 group",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0 transition-colors",
                isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-primary-400" />}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="mt-4 mb-1 px-2 pb-1">
              <p className="text-[10px] font-semibold font-jakarta text-slate-400 uppercase tracking-widest">
                Admin
              </p>
            </div>
            {adminItems.map((item) => {
              const Icon     = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-jakarta font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600")} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-primary-400" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Mithören player */}
      <div className="border-t border-slate-200 px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-[10px] font-semibold font-jakarta text-slate-400 uppercase tracking-widest">
            Mithören
          </p>
          {listeners !== null && (
            <div className="flex items-center gap-1 text-[10px] font-jakarta text-slate-400">
              <Headphones className="w-3 h-3" />
              <span>{listeners}</span>
            </div>
          )}
        </div>

        <div className={cn(
          "rounded-xl border transition-all duration-200 overflow-hidden",
          playing ? "bg-primary-50 border-primary-200" : "bg-slate-50 border-slate-200"
        )}>
          {/* Now Playing info */}
          {song && (
            <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
              {/* Album art */}
              <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={song.art}
                  alt="Album Art"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold font-jakarta text-slate-900 leading-none truncate">
                  {song.title}
                </p>
                <p className="text-[10px] font-jakarta text-slate-500 mt-0.5 leading-none truncate">
                  {song.artist}
                </p>
              </div>
            </div>
          )}

          {/* Controls row */}
          <div className="flex items-center gap-2.5 px-3 pb-3">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                playing
                  ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-primary-600 hover:text-white hover:border-primary-600"
              )}
            >
              {buffering ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : playing ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

            {/* Status label */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-jakarta text-slate-500 leading-none">
                {buffering ? "Verbinde…" : playing ? "Läuft live" : song ? "Jetzt spielen" : "BeatZone FM"}
              </p>
            </div>

            {/* Live dot */}
            {playing && !buffering && (
              <span className="flex items-center gap-1 text-[9px] font-bold font-syne text-red-600 shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                LIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* User footer */}
      <div className="border-t border-slate-200 p-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(session?.user?.name || "?")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold font-jakarta text-slate-900 truncate leading-none">
              {session?.user?.name || "—"}
            </p>
            <p className="text-xs font-jakarta text-slate-400 mt-0.5 truncate leading-none">
              {session?.user?.role === "admin" ? "Owner" : session?.user?.role === "dj" ? "DJ" : "Radio Moderator"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Abmelden"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-400" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
