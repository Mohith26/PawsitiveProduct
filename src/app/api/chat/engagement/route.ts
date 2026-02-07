import { streamText } from "ai";
import { getModel } from "@/lib/ai/anthropic";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "ANTHROPIC_API_KEY is not configured. Add it to your .env.local file to enable the AI agent.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages: rawMessages } = await request.json();

  // Convert from AI SDK v6 parts format to content format
  const messages = rawMessages.map((m: { role: string; content?: string; parts?: { type: string; text: string }[] }) => ({
    role: m.role,
    content: m.content ?? m.parts?.filter((p: { type: string }) => p.type === "text").map((p: { text: string }) => p.text).join("") ?? "",
  }));

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: config } = await supabase
    .from("agent_config")
    .select("*")
    .eq("agent_type", "engagement")
    .single();

  try {
    const result = streamText({
      model: getModel(config?.model_id),
      system:
        config?.system_prompt ??
        "You are a helpful engagement agent for a pet industry community.",
      messages,
      maxOutputTokens: config?.max_tokens ?? 1024,
      temperature: config?.temperature ? Number(config.temperature) : 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Engagement agent error:", error);
    return new Response(
      JSON.stringify({
        error:
          "Failed to connect to AI service. Please check your API key configuration.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
