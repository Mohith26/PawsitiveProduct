"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TypingIndicator } from "@/lib/types/chat";

export function useTypingIndicator(channelId: string, userId: string, userName: string) {
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const supabase = createClient();
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    const channel = supabase.channel(`typing:${channelId}`);

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user_id === userId) return;

        setTypingUsers((prev) => {
          const exists = prev.find((t) => t.user_id === payload.user_id);
          if (exists) return prev;
          return [...prev, payload as TypingIndicator];
        });

        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((t) => t.user_id !== payload.user_id)
          );
        }, 3000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, userId, supabase]);

  const sendTyping = useCallback(() => {
    if (timeoutRef.current) return; // Throttle

    const channel = supabase.channel(`typing:${channelId}`);
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: userId, user_name: userName, channel_id: channelId },
    });

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = undefined;
    }, 2000);
  }, [channelId, userId, userName, supabase]);

  return { typingUsers, sendTyping };
}
