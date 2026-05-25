"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Radio, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNowPlaying } from "@/hooks/use-now-playing";
import { GreetingsBox } from "@/components/greetings-box";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard",            subtitle: "Willkommen zurück" },
  "/sendeplan": { title: "Sendeplan",            subtitle: "Wochenübersicht aller Sendungen" },
  "/dokumente": { title: "Dokumente",            subtitle: "Dokumente und Dateien" },
  "/regeln":    { title: "Regeln & Richtlinien", subtitle: "Verhaltenskodex und Stationsregeln" },
  "/jingles":   { title: "Jingle-Bibliothek",    subtitle: "Audio-Elemente für den Sendebetrieb" },
  "/team":      { title: "Team",                 subtitle: "Alle Moderatorinnen und Moderatoren" },
  "/profil":    { title: "Mein Profil",          subtitle: "Profileinstellungen und persönliche Daten" },
  "/admin":     { title: "Administration",       subtitle: "Benutzerverwaltung und Systemeinstellungen" },
  "/discord":   { title: "Discord Bot",          subtitle: "Musikbot für euren Discord-Server" },
  "/wuensche":  { title: "Grüße & Wünsche",      subtitle: "Eingesendete Grüße und Musikwünsche" },
  "/onair":     { title: "On Air Panel",         subtitle: "Live-Steuerung der aktuellen Sendung" },
};

export function Topbar() {
  const pathname   = usePathname();
  const page       = PAGE_TITLES[pathname] || { title: "Radio Panel", subtitle: "" };
  const nowPlaying = useNowPlaying(15000);

  const listeners = nowPlaying?.listeners?.current ?? null;
  const song      = nowPlaying?.now_playing?.song;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
      {/* Page title */}
      <div>
        <h1 className="font-syne font-bold text-slate-900 text-base leading-none tracking-tight">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="text-xs font-jakarta text-slate-400 mt-1 leading-none">
            {page.subtitle}
          </p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2.5">

        {/* Now playing mini pill */}
        {song && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pl-2 pr-3 py-1.5 max-w-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={song.art}
              alt=""
              className="w-5 h-5 rounded-full object-cover shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <p className="text-[11px] font-jakarta text-slate-600 truncate leading-none">
              <span className="font-semibold">{song.title}</span>
              {song.artist && <span className="text-slate-400"> · {song.artist}</span>}
            </p>
          </div>
        )}

        {/* Grüße & Wünsche box */}
        <GreetingsBox />

        {/* ON AIR + Listener count — clickable link to /onair */}
        <Link href="/onair" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 hover:bg-red-100 hover:border-red-300 transition-colors cursor-pointer">
          {/* Live pulse */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <Radio className="w-3 h-3 text-red-600" />
          <span className="text-xs font-semibold font-syne text-red-600">ON AIR</span>

          {listeners !== null && (
            <>
              <div className="w-px h-3 bg-red-200 mx-0.5" />
              <Headphones className="w-3 h-3 text-red-500" />
              <span className="text-xs font-semibold font-jakarta text-red-600">{listeners}</span>
            </>
          )}
        </Link>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-primary-600 rounded-full" />
        </Button>
      </div>
    </header>
  );
}
