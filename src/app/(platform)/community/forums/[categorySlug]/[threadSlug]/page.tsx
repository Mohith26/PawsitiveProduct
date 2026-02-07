"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PostEditor } from "@/components/community/post-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import type { ForumThread, ForumPost } from "@/lib/types/forum";

export default function ThreadDetailPage() {
  const params = useParams();
  const categorySlug = params.categorySlug as string;
  const threadSlug = params.threadSlug as string;
  const { user } = useAuth();
  const supabase = createClient();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: category } = await supabase
        .from("forum_categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

      if (!category) return;

      const { data: threadData } = await supabase
        .from("forum_threads")
        .select("*, author:profiles(*)")
        .eq("category_id", category.id)
        .eq("slug", threadSlug)
        .single();

      if (threadData) {
        setThread(threadData as unknown as ForumThread);

        const { data: postsData } = await supabase
          .from("forum_posts")
          .select("*, author:profiles(*)")
          .eq("thread_id", threadData.id)
          .order("created_at", { ascending: true });

        setPosts((postsData as unknown as ForumPost[]) ?? []);
      }
      setLoading(false);
    };

    fetchData();
  }, [categorySlug, threadSlug, supabase]);

  const handleReply = async (body: string) => {
    if (!user || !thread) return;
    const { data } = await supabase
      .from("forum_posts")
      .insert({
        thread_id: thread.id,
        author_id: user.id,
        body,
      })
      .select("*, author:profiles(*)")
      .single();

    if (data) {
      setPosts((prev) => [...prev, data as unknown as ForumPost]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading thread...</div>;
  }

  if (!thread) {
    return <div className="flex items-center justify-center p-8">Thread not found.</div>;
  }

  const authorName = thread.author?.full_name ?? "Unknown";
  const initials = authorName.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {thread.is_resolved && <Badge variant="secondary">Resolved</Badge>}
          {thread.is_locked && <Badge variant="outline">Locked</Badge>}
        </div>
        <h1 className="text-3xl font-bold">{thread.title}</h1>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={thread.author?.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{authorName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="prose max-w-none text-sm">{thread.body}</div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-semibold">{posts.length} {posts.length === 1 ? "Reply" : "Replies"}</h3>
        {posts.map((post) => {
          const postAuthor = post.author?.full_name ?? "Unknown";
          const postInitials = postAuthor.split(" ").map((n) => n[0]).join("").toUpperCase();
          return (
            <div key={post.id} className="flex gap-3 rounded-md border p-4">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={post.author?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{postInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{postAuthor}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                  {post.is_solution && <Badge variant="secondary">Solution</Badge>}
                </div>
                <p className="text-sm">{post.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!thread.is_locked && user && (
        <>
          <Separator />
          <PostEditor onSubmit={handleReply} />
        </>
      )}
    </div>
  );
}
