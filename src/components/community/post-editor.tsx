"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PostEditorProps {
  onSubmit: (body: string) => Promise<void>;
  placeholder?: string;
  submitLabel?: string;
}

export function PostEditor({ onSubmit, placeholder = "Write your reply...", submitLabel = "Post Reply" }: PostEditorProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    await onSubmit(body.trim());
    setBody("");
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <Tabs defaultValue="write">
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="write">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            rows={4}
          />
        </TabsContent>
        <TabsContent value="preview">
          <div className="min-h-[100px] rounded-md border p-3 text-sm">
            {body || <span className="text-muted-foreground">Nothing to preview</span>}
          </div>
        </TabsContent>
      </Tabs>
      <Button onClick={handleSubmit} disabled={!body.trim() || submitting}>
        {submitting ? "Posting..." : submitLabel}
      </Button>
    </div>
  );
}
