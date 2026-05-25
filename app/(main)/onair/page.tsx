import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudioSettings } from "@/app/actions/studio";
import { OnAirClient } from "./on-air-client";

export default async function OnAirPage() {
  const [session, settings] = await Promise.all([
    getServerSession(authOptions),
    getStudioSettings(),
  ]);

  return (
    <OnAirClient
      initialGreetingsOpen={settings?.greetingsOpen    ?? false}
      initialSongRequestsOpen={settings?.songRequestsOpen ?? false}
      userName={session?.user?.name ?? ""}
    />
  );
}
