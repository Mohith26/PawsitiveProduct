"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { ChatMessage } from "@/lib/types/chat";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId;
        const senderName = message.sender?.full_name ?? "Unknown";
        const initials = senderName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();

        return (
          <div key={message.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={message.sender?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{senderName}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.created_at), "h:mm a")}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
