import { streamText } from "ai";
import { getModel } from "@/lib/ai/anthropic";
import { createClient } from "@/lib/supabase/server";
import { searchDocuments } from "@/lib/ai/rag-pipeline";

export async function POST(request: Request) {
  const { messages } = await request.json();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: config } = await supabase
    .from("agent_config")
    .select("*")
    .eq("agent_type", "recommendation")
    .single();

  // Get the last user message for RAG retrieval
  const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop();
  let context = "";

  if (lastUserMessage) {
    try {
      const docs = await searchDocuments(lastUserMessage.content, {
        matchCount: 5,
        matchThreshold: 0.6,
      });

      if (docs && docs.length > 0) {
        context = "\n\nRelevant knowledge base context:\n" +
          docs.map((d: { content: string; source_type: string }) =>
            `[${d.source_type}]: ${d.content}`
          ).join("\n\n");
      }
    } catch {
      // RAG retrieval failed, continue without context
    }
  }

  const systemPrompt = (config?.system_prompt ?? "You are a helpful AI tool recommendation agent.") + context;

  const result = streamText({
    model: getModel(config?.model_id),
    system: systemPrompt,
    messages,
    maxOutputTokens: config?.max_tokens ?? 1024,
    temperature: config?.temperature ? Number(config.temperature) : 0.7,
  });

  return result.toTextStreamResponse();
}
