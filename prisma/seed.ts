import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.studioSettings.deleteMany();
  await prisma.warning.deleteMany();
  await prisma.show.deleteMany();
  await prisma.jingle.deleteMany();
  await prisma.document.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.user.deleteMany();

  // Studio settings singleton
  await prisma.studioSettings.create({
    data: { id: 1, greetingsOpen: false, songRequestsOpen: false },
  });

  // Hash passwords
  const ownerPw = await bcrypt.hash("owner123", 12);

  // Create owners only — other users are added by owners via Admin panel
  await prisma.user.create({ data: { name: "Marius",      password: ownerPw, role: "admin" } });
  await prisma.user.create({ data: { name: "Galaxyflawa", password: ownerPw, role: "admin" } });

  console.log("✅ Users created");

  // Rules — sourced from "BeatZone FM Intern Regeln" (official team document)
  const rules = [
    {
      title: "§1 – Intern bleibt intern",
      content: "Alles aus internen Channels, Meetings und Talks bleibt im Team. Keine Screenshots, Aufnahmen oder Infos nach außen.",
      category: "Verhalten",
      order: 1,
    },
    {
      title: "§2 – Verschwiegenheit",
      content: "Sendepläne, interne Streitigkeiten, Bewerbungen und persönliche Daten von Teammitgliedern sind vertraulich.",
      category: "Verhalten",
      order: 2,
    },
    {
      title: "§3 – Verlässlichkeit",
      content: "Halte dich an deine Sendezeiten und Aufgaben. Bei Ausfall rechtzeitig Bescheid geben.",
      category: "Verhalten",
      order: 3,
    },
    {
      title: "§4 – Kritik intern klären",
      content: "Probleme mit Teammitgliedern werden intern geklärt – nicht öffentlich und nicht über Umwege.",
      category: "Verhalten",
      order: 4,
    },
    {
      title: "§5 – Loyalität",
      content: "Keine Abwerbung von Membern oder Team für andere Sender. Kein Schlechtreden von BeatZone FM nach außen.",
      category: "Verhalten",
      order: 5,
    },
    {
      title: "§6 – Meetings",
      content: "Teilnahme an Teammeetings ist Pflicht. Bei Verhinderung vorher abmelden.",
      category: "Organisation",
      order: 6,
    },
    {
      title: "§7 – Zugänge & Passwörter",
      content: "Logins, Tokens und Zugänge werden nicht weitergegeben – auch nicht an andere Teammitglieder ohne Absprache mit der Leitung.",
      category: "Sicherheit",
      order: 7,
    },
    {
      title: "§8 – Auftreten",
      content: "Du repräsentierst BeatZone FM – auf und außerhalb des Servers. Verhalte dich entsprechend.",
      category: "Verhalten",
      order: 8,
    },
    {
      title: "§9 – Austritt",
      content: "Beim Verlassen des Teams: alle Zugänge zurückgeben, interne Infos bleiben weiterhin vertraulich.",
      category: "Organisation",
      order: 9,
    },
  ];

  for (const r of rules) {
    await prisma.rule.create({ data: r });
  }

  console.log("✅ Rules created");
  console.log("ℹ️  Documents & Jingles: leer – werden vom Team über Admin-Panel befüllt");
  console.log("\n🎙️  Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("  Owner: Marius      / owner123");
  console.log("  Owner: Galaxyflawa / owner123");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
