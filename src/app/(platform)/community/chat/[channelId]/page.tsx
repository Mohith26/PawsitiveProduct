"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { useRealtimePresence } from "@/hooks/use-realtime-presence";
import { MessageList } from "@/components/community/message-list";
import { MessageInput } from "@/components/community/message-input";
import { Badge } from "@/components/ui/badge";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const { user, profile } = useAuth();
  const [channelName, setChannelName] = useState("Channel");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("chat_channels")
      .select("name")
      .eq("id", channelId)
      .single()
      .then(({ data }) => {
        if (data) setChannelName(data.name);
      });
  }, [channelId]);
  const { messages, loading, sendMessage } = useRealtimeMessages(channelId);
  const { typingUsers, sendTyping } = useTypingIndicator(
    channelId,
    user?.id ?? "",
    profile?.full_name ?? ""
  );
  const { onlineUsers } = useRealtimePresence(
    channelId,
    user?.id ?? "",
    profile?.full_name ?? ""
  );

  const handleSend = async (content: string) => {
    if (!user) return;
    await sendMessage(content, user.id);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading messages...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold"># {channelName}</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{onlineUsers.length} online</Badge>
        </div>
      </div>

      <MessageList messages={messages} currentUserId={user?.id ?? ""} />

      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-muted-foreground">
          {typingUsers.map((t) => t.user_name).join(", ")}{" "}
          {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      <MessageInput onSend={handleSend} onTyping={sendTyping} disabled={!user} />
    </div>
  );
}
