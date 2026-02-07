"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateThreadDialogProps {
  categoryId: string;
}

export function CreateThreadDialog({ categoryId }: CreateThreadDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !body.trim()) return;
    setSubmitting(true);

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();

    const { error } = await supabase.from("forum_threads").insert({
      category_id: categoryId,
      author_id: user.id,
      title: title.trim(),
      slug,
      body: body.trim(),
    });

    if (error) {
      console.error("Failed to create thread:", error);
      setSubmitting(false);
      return;
    }

    setTitle("");
    setBody("");
    setOpen(false);
    setSubmitting(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Thread
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Thread</DialogTitle>
          <DialogDescription>
            Create a discussion topic in this category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thread-title">Title *</Label>
            <Input
              id="thread-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to discuss?"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thread-body">Body *</Label>
            <Textarea
              id="thread-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts, questions, or ideas..."
              rows={6}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !body.trim()}
            >
              {submitting ? "Creating..." : "Create Thread"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
