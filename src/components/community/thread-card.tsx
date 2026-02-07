import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, Pin, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ForumThread } from "@/lib/types/forum";

interface ThreadCardProps {
  thread: ForumThread;
  categorySlug: string;
}

export function ThreadCard({ thread, categorySlug }: ThreadCardProps) {
  const authorName = thread.author?.full_name ?? "Unknown";
  const initials = authorName.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <Link
      href={`/community/forums/${categorySlug}/${thread.slug}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-accent/50"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={thread.author?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {thread.is_pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
            <h3 className="font-medium leading-tight">{thread.title}</h3>
            {thread.is_resolved && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />Resolved
              </Badge>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{thread.body}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{authorName}</span>
            <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{thread.reply_count}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{thread.view_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
