import { createClient } from "@/lib/supabase/server";
import { ChannelList } from "@/components/community/channel-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChatChannel } from "@/lib/types/chat";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: channels } = await supabase
    .from("chat_channels")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community Chat</h1>
        <p className="text-muted-foreground">Real-time conversations with pet industry peers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <CardDescription>Select a channel to join the conversation</CardDescription>
        </CardHeader>
        <CardContent>
          {channels && channels.length > 0 ? (
            <ChannelList channels={channels as ChatChannel[]} />
          ) : (
            <p className="text-sm text-muted-foreground">No channels available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
