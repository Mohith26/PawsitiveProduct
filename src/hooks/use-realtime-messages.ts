"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types/chat";

export function useRealtimeMessages(channelId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  // Fetch initial messages
  useEffect(() => {
    const supabase = supabaseRef.current;
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
  }, [channelId]);

  // Subscribe to new messages (for messages from OTHER users/tabs)
  useEffect(() => {
    const supabase = supabaseRef.current;
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
          // Avoid duplicates - check if we already have this message (from optimistic add)
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            // We don't have sender info from the payload, fetch it
            return prev;
          });

          const { data: messageWithSender } = await supabase
            .from("chat_messages")
            .select("*, sender:profiles(*)")
            .eq("id", payload.new.id)
            .single();

          if (messageWithSender) {
            setMessages((prev) => {
              // Replace optimistic message or add new one
              const exists = prev.some((m) => m.id === messageWithSender.id);
              if (exists) {
                return prev.map((m) =>
                  m.id === messageWithSender.id
                    ? (messageWithSender as ChatMessage)
                    : m
                );
              }
              return [...prev, messageWithSender as ChatMessage];
            });
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
  }, [channelId]);

  const sendMessage = useCallback(
    async (content: string, senderId: string) => {
      const supabase = supabaseRef.current;

      // Insert and get back the created message
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          channel_id: channelId,
          sender_id: senderId,
          content,
        })
        .select("*, sender:profiles(*)")
        .single();

      if (!error && data) {
        // Optimistically add to local state immediately
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data as ChatMessage];
        });
      }

      return { error };
    },
    [channelId]
  );

  return { messages, loading, sendMessage };
}
