import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ThreadCard } from "@/components/community/thread-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ForumThread } from "@/lib/types/forum";

interface Props {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ThreadListPage({ params, searchParams }: Props) {
  const { categorySlug } = await params;
  const { q, page } = await searchParams;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("forum_categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) notFound();

  const currentPage = parseInt(page ?? "1", 10);
  const pageSize = 20;
  const offset = (currentPage - 1) * pageSize;

  let query = supabase
    .from("forum_threads")
    .select("*, author:profiles(*)", { count: "exact" })
    .eq("category_id", category.id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (q) {
    query = query.textSearch("search_vector", q);
  }

  const { data: threads, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <form className="flex-1">
          <Input name="q" placeholder="Search threads..." defaultValue={q} />
        </form>
      </div>

      <div className="space-y-2">
        {threads?.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread as unknown as ForumThread}
            categorySlug={categorySlug}
          />
        ))}
        {(!threads || threads.length === 0) && (
          <p className="text-center py-8 text-muted-foreground">No threads yet. Start one!</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link href={`/community/forums/${categorySlug}?page=${currentPage - 1}${q ? `&q=${q}` : ""}`}>
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/community/forums/${categorySlug}?page=${currentPage + 1}${q ? `&q=${q}` : ""}`}>
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
