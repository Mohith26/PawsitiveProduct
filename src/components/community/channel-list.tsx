"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Hash, Lock } from "lucide-react";
import type { ChatChannel } from "@/lib/types/chat";

interface ChannelListProps {
  channels: ChatChannel[];
}

export function ChannelList({ channels }: ChannelListProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {channels.map((channel) => {
        const isActive = pathname === `/community/chat/${channel.id}`;
        return (
          <Link
            key={channel.id}
            href={`/community/chat/${channel.id}`}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            {channel.is_private ? (
              <Lock className="h-4 w-4 shrink-0" />
            ) : (
              <Hash className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{channel.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
