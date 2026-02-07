"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  onTyping?: () => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    await onSend(content.trim());
    setContent("");
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
      <Input
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onTyping?.();
        }}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={!content.trim() || sending || disabled}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
