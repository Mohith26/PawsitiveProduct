import { createAnthropic } from "@ai-sdk/anthropic";

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function getModel(modelId?: string) {
  return anthropic(modelId ?? "claude-sonnet-4-5-20250929");
}
