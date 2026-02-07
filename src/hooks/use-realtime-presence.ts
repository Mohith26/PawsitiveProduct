"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface PresenceUser {
  user_id: string;
  user_name: string;
  online_at: string;
}

export function useRealtimePresence(channelId: string, userId: string, userName: string) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase.channel(`presence:${channelId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const users = Object.values(state)
          .flat()
          .map((p) => ({
            user_id: p.user_id,
            user_name: p.user_name,
            online_at: p.online_at,
          }));
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            user_name: userName,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, userId, userName]);

  return { onlineUsers };
}
