import React from "react";
import { ExternalLink, Play, SkipForward, List, Volume2, Shuffle, RefreshCw, Search, Mic2, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1507851906846949376";

const COMMANDS = [
  { cmd: "/play",     desc: "Song oder YouTube-Link abspielen",         icon: Play },
  { cmd: "/skip",     desc: "Aktuellen Song überspringen",              icon: SkipForward },
  { cmd: "/queue",    desc: "Warteschlange anzeigen",                   icon: List },
  { cmd: "/volume",   desc: "Lautstärke anpassen (0–100)",              icon: Volume2 },
  { cmd: "/shuffle",  desc: "Warteschlange mischen",                    icon: Shuffle },
  { cmd: "/loop",     desc: "Song oder Queue-Loop aktivieren",          icon: Repeat },
  { cmd: "/search",   desc: "Song auf YouTube suchen",                  icon: Search },
  { cmd: "/nowplaying", desc: "Aktuell spielenden Song anzeigen",       icon: Mic2 },
  { cmd: "/restart",  desc: "Song von vorne starten",                   icon: RefreshCw },
];

const FEATURES = [
  { title: "Kristallklarer Sound",   desc: "Hochwertige Audio-Wiedergabe direkt in deinem Voice-Channel.",  emoji: "🎵" },
  { title: "YouTube & Spotify",      desc: "Spiele Songs, Playlists und Alben von YouTube und mehr.",         emoji: "📺" },
  { title: "Warteschlange",          desc: "Mehrere Songs einreihen und die Queue beliebig verwalten.",       emoji: "📋" },
  { title: "24/7 Betrieb",           desc: "Der Bot bleibt im Channel – auch wenn alle Mitglieder weg sind.", emoji: "⚡" },
];

function DiscordIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function DiscordBotPage() {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-up">
      {/* Hero card */}
      <div
        className="relative rounded-2xl overflow-hidden p-8"
        style={{
          background: "linear-gradient(135deg, #5865F2 0%, #4752C4 50%, #3541b3 100%)",
          boxShadow: "0 8px 32px rgba(88,101,242,0.35)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ background: "radial-gradient(circle, white, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 translate-y-1/2 -translate-x-1/4"
          style={{ background: "radial-gradient(circle, white, transparent)" }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Bot avatar */}
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 border border-white/30">
            <DiscordIcon className="w-10 h-10 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-syne text-white/90 bg-white/20 rounded-full px-2 py-0.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Online
              </span>
            </div>
            <h2 className="font-syne font-bold text-3xl text-white tracking-tight mb-1">
              BeatZone Musikbot
            </h2>
            <p className="font-jakarta text-white/70 text-sm leading-relaxed max-w-md">
              Der offizielle Musikbot von BeatZone FM – direkt in eurem Discord-Server. Spiel Songs, verwalte Queues und genuss kristallklaren Sound.
            </p>
          </div>

          {/* Invite button */}
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#5865F2] font-syne font-bold text-sm rounded-xl hover:bg-white/90 active:scale-[0.97] transition-all shrink-0"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
          >
            <DiscordIcon className="w-4 h-4" />
            Bot einladen
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{f.emoji}</span>
              <div>
                <p className="font-semibold font-jakarta text-slate-900 text-sm mb-1">{f.title}</p>
                <p className="text-xs font-jakarta text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Commands */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#5865F220" }}>
              <DiscordIcon className="w-4 h-4" style={{ color: "#5865F2" }} />
            </div>
            <CardTitle>Befehle</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {COMMANDS.map(({ cmd, desc, icon: Icon }) => (
              <div
                key={cmd}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-[#5865F2]/30 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5865F2] transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-slate-900">{cmd}</p>
                  <p className="text-[11px] font-jakarta text-slate-400 leading-none mt-0.5 truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Einrichtung</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {[
              { step: "1", text: 'Klicke auf "Bot einladen" und wähle deinen Discord-Server aus.' },
              { step: "2", text: "Bestätige die benötigten Berechtigungen (Voice, Messages, etc.)." },
              { step: "3", text: 'Gehe in einen Voice-Channel und tippe /play gefolgt von einem Song-Namen oder YouTube-Link.' },
              { step: "4", text: "Genieße die Musik! Mit /queue siehst du alle einreihten Songs." },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#5865F2]/10 text-[#5865F2] text-xs font-bold font-syne flex items-center justify-center shrink-0 mt-0.5">
                  {step}
                </span>
                <p className="text-sm font-jakarta text-slate-600 leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Bottom invite CTA */}
      <div className="flex items-center justify-between bg-[#5865F2]/5 border border-[#5865F2]/20 rounded-2xl px-6 py-4">
        <div>
          <p className="font-syne font-bold text-slate-900 text-sm">Bereit?</p>
          <p className="text-xs font-jakarta text-slate-500">Füge den Bot jetzt zu deinem Server hinzu.</p>
        </div>
        <a
          href={INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-jakarta font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ backgroundColor: "#5865F2", boxShadow: "0 4px 16px rgba(88,101,242,0.3)" }}
        >
          <DiscordIcon className="w-4 h-4" />
          Jetzt einladen
        </a>
      </div>
    </div>
  );
}
