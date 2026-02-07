import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestDocument } from "@/lib/ai/rag-pipeline";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sourceType, sourceId, content, metadata } = await request.json();

  if (!sourceType || !sourceId || !content) {
    return NextResponse.json(
      { error: "sourceType, sourceId, and content are required" },
      { status: 400 }
    );
  }

  try {
    await ingestDocument(sourceType, sourceId, content, metadata ?? {});
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to ingest document" },
      { status: 500 }
    );
  }
}
