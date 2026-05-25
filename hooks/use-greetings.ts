"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

export type Greeting = {
  id: string;
  senderName: string;
  message: string;
  songRequest: string | null;
  isRead: boolean;
  createdAt: string;
};

export function useGreetings(_pollInterval = 20000) {
  const [greetings,   setGreetings]   = useState<Greeting[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Counter bump forces a re-render so callers using `refresh()` still work.
  const [, setBump] = useState(0);
  const refresh = useCallback(() => setBump((n) => n + 1), []);

  useEffect(() => {
    const q = query(
      collection(db, "greetings"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: Greeting[] = snap.docs.map((d) => {
        const data = d.data();
        const ts   = data.createdAt as Timestamp | null;
        return {
          id:          d.id,
          senderName:  data.senderName  ?? "",
          message:     data.message     ?? "",
          songRequest: data.songRequest ?? null,
          isRead:      data.isRead      ?? false,
          createdAt:   ts
            ? new Date(ts.seconds * 1000).toISOString()
            : new Date().toISOString(),
        };
      });
      setGreetings(items);
      setUnreadCount(items.filter((g) => !g.isRead).length);
    });

    return () => unsub();
  }, []);

  return { greetings, unreadCount, refresh };
}
