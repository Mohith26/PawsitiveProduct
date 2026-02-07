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

export function CreateChannelDialog() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSubmitting(true);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { data: channel, error } = await supabase
      .from("chat_channels")
      .insert({
        name: name.trim(),
        slug: `${slug}-${Date.now()}`,
        description: description.trim() || null,
        is_private: false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create channel:", error);
      setSubmitting(false);
      return;
    }

    // Auto-join the creator as a channel member
    if (channel) {
      await supabase.from("chat_channel_members").insert({
        channel_id: channel.id,
        user_id: user.id,
        role: "admin",
      });
    }

    setName("");
    setDescription("");
    setOpen(false);
    setSubmitting(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Create a new chat channel for the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name *</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. vet-ai-tips"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel-desc">Description</Label>
            <Textarea
              id="channel-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
