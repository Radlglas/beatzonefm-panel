"use client";

import { useEffect, useState } from "react";

export type NowPlaying = {
  now_playing: {
    song: {
      title: string;
      artist: string;
      art: string;
    };
    elapsed: number;
    duration: number;
  };
  song_history: Array<{
    song: {
      title: string;
      artist: string;
      art: string;
    };
    played_at: number;
  }>;
  listeners: {
    current: number;
    unique: number;
    total: number;
  };
  live: {
    is_live: boolean;
    streamer_name: string;
  };
  station: {
    name: string;
    listen_url: string;
  };
};

const API_URL = "https://rp.cynoria.de/api/nowplaying/1";

export function useNowPlaying(pollInterval = 15000) {
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // ignore network errors silently
      }
    }

    fetchData();
    const id = setInterval(fetchData, pollInterval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollInterval]);

  return data;
}
