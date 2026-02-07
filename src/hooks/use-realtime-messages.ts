"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types/chat";

export function useRealtimeMessages(channelId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*, sender:profiles(*)")
        .eq("channel_id", channelId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .limit(100);

      setMessages((data as ChatMessage[]) ?? []);
      setLoading(false);
    };

    fetchMessages();
  }, [channelId, supabase]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const { data: messageWithSender } = await supabase
            .from("chat_messages")
            .select("*, sender:profiles(*)")
            .eq("id", payload.new.id)
            .single();

          if (messageWithSender) {
            setMessages((prev) => [...prev, messageWithSender as ChatMessage]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, supabase]);

  const sendMessage = useCallback(
    async (content: string, senderId: string) => {
      const { error } = await supabase.from("chat_messages").insert({
        channel_id: channelId,
        sender_id: senderId,
        content,
      });
      return { error };
    },
    [channelId, supabase]
  );

  return { messages, loading, sendMessage };
}
