"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./chat-message";
import { Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatInterfaceProps {
  apiEndpoint: string;
  agentName: string;
  placeholder?: string;
}

export function ChatInterface({ apiEndpoint, agentName, placeholder = "Type your message..." }: ChatInterfaceProps) {
  const transport = useMemo(() => new DefaultChatTransport({ api: apiEndpoint }), [apiEndpoint]);

  const { messages, sendMessage, status } = useChat({
    transport,
  });

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    setError("");
    try {
      await sendMessage({ text });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
    }
  };

  // Check for API errors by making a preflight-style check
  useEffect(() => {
    if (status === "error") {
      setError("Failed to get a response from the AI agent. Please check that ANTHROPIC_API_KEY is set in .env.local");
    }
  }, [status]);

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">{agentName}</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Start a conversation with {agentName}
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={message.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("") ?? ""}
            />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {agentName} is thinking...
            </div>
          )}
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
