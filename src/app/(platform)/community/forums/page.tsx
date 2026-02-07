import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessagesSquare } from "lucide-react";

export default async function ForumsPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("forum_categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discussion Forums</h1>
        <p className="text-muted-foreground">Ask questions, share insights, and learn from peers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories?.map((category) => (
          <Link key={category.id} href={`/community/forums/${category.slug}`}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MessagesSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{category.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
        {(!categories || categories.length === 0) && (
          <p className="text-muted-foreground col-span-2 text-center py-8">
            No forum categories yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
