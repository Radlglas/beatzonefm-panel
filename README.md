# 🎙 Radiopendel — Sender-Panel

Das interne Verwaltungs-Panel für Radiopendel-Moderatorinnen und Moderatoren.

## Features

- **Dashboard** — Übersicht über aktuelle Sendungen, Statistiken und eigene Shows
- **Sendeplan** — Wöchentliches Kalender-Grid aller Sendungen mit farblicher Markierung
- **Dokumente** — Datei-Bibliothek kategorisiert nach Themen (Technik, Organisation, Rechtliches, …)
- **Regeln** — Verbindliche Teamregeln (§1–§9), direkt aus dem offiziellen Regelwerk
- **Jingles** — Audiobibliothek mit Kategorisierung und Tag-System
- **Team** — Übersicht aller Moderatoren mit Profil und Sendungen
- **Profil** — Persönliche Daten und eigene Sendungen
- **Admin** — Benutzerverwaltung (nur für Administratoren)

## Tech-Stack

| Technologie | Zweck |
|---|---|
| Next.js 14 (App Router) | Frontend-Framework |
| TypeScript | Typsicherheit |
| Tailwind CSS | Styling |
| shadcn/ui (Radix UI) | UI-Komponenten |
| Prisma ORM | Datenbank-Zugriff |
| SQLite | Datenbank |
| NextAuth.js v4 | Authentifizierung |
| bcryptjs | Passwort-Hashing |
| Lucide React | Icons |
| date-fns | Datumsformatierung |
| Zod | Validierung |

## Voraussetzungen

- Node.js ≥ 18
- npm ≥ 9

## Installation

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen setzen (.env ist bereits enthalten)
# Enthält: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 3. Datenbank erstellen und Schema einspielen
npm run db:push

# 4. Seed-Daten einspielen (Nutzer, Sendungen, Regeln, Jingles, Dokumente)
npm run db:seed

# 5. Entwicklungsserver starten
npm run dev
```

Die App ist dann unter **http://localhost:3000** erreichbar.

## Standard-Zugangsdaten

| Name | E-Mail | Passwort | Rolle |
|---|---|---|---|
| Marius | marius@radiopendel.de | admin123 | Admin |
| Lena Hoffmann | lena@radiopendel.de | mod123 | Moderator |
| Jonas Weber | jonas@radiopendel.de | mod123 | Moderator |
| Sarah Klein | sarah@radiopendel.de | mod123 | Moderator |

> ⚠️ Passwörter nach der ersten Anmeldung ändern!

## Projektstruktur

```
radiopendel/
├── app/
│   ├── (auth)/login/        # Login-Seite
│   ├── (main)/              # Geschützter Bereich (Sidebar-Layout)
│   │   ├── dashboard/
│   │   ├── sendeplan/
│   │   ├── dokumente/
│   │   ├── regeln/
│   │   ├── jingles/
│   │   ├── team/
│   │   ├── profil/
│   │   └── admin/
│   └── api/auth/            # NextAuth API-Route
├── components/
│   ├── ui/                  # Basiskomponenten (shadcn-Stil)
│   ├── sidebar.tsx
│   └── topbar.tsx
├── lib/
│   ├── auth.ts              # NextAuth-Konfiguration
│   ├── db.ts                # Prisma-Client
│   └── utils.ts             # Hilfsfunktionen
├── prisma/
│   ├── schema.prisma        # Datenbankmodelle
│   └── seed.ts              # Seed-Daten
└── hooks/
    └── use-toast.ts
```

## Datenmodelle

- **User** — Moderatoren und Admins mit Profildaten
- **Show** — Sendungen mit Wochentag, Start-/Endzeit und Farbe
- **Document** — Dokumente mit Kategorie und Upload-Infos
- **Rule** — Teamregeln mit Kategorie und Reihenfolge
- **Jingle** — Audio-Jingles mit Tags und Kategorie

## Lizenz

Intern — nicht für die Öffentlichkeit bestimmt.
