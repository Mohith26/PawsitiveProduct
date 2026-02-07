import { streamText } from "ai";
import { getModel } from "@/lib/ai/anthropic";
import { createClient } from "@/lib/supabase/server";

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
    .eq("agent_type", "engagement")
    .single();

  const result = streamText({
    model: getModel(config?.model_id),
    system: config?.system_prompt ?? "You are a helpful engagement agent for a pet industry community.",
    messages,
    maxOutputTokens: config?.max_tokens ?? 1024,
    temperature: config?.temperature ? Number(config.temperature) : 0.7,
  });

  return result.toTextStreamResponse();
}
