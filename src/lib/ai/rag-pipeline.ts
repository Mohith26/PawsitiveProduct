import { createAdminClient } from "@/lib/supabase/admin";

const EMBEDDING_MODEL = "text-embedding-3-small";
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  const json = await response.json();
  return json.data[0].embedding;
}

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

export async function ingestDocument(
  sourceType: string,
  sourceId: string,
  content: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = createAdminClient();
  const chunks = chunkText(content);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    await supabase.from("documents").insert({
      source_type: sourceType,
      source_id: sourceId,
      content: chunk,
      embedding,
      metadata,
    });
  }
}

export async function searchDocuments(
  query: string,
  options: {
    matchThreshold?: number;
    matchCount?: number;
    filterSourceType?: string;
  } = {}
) {
  const supabase = createAdminClient();
  const embedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: options.matchThreshold ?? 0.7,
    match_count: options.matchCount ?? 10,
    filter_source_type: options.filterSourceType ?? null,
  });

  if (error) throw error;
  return data;
}
