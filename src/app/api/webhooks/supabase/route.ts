import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/ai/rag-pipeline";

export async function POST(request: Request) {
  const payload = await request.json();
  const { type, table, record } = payload;

  if (type !== "INSERT") {
    return NextResponse.json({ ok: true });
  }

  try {
    switch (table) {
      case "forum_posts":
        await ingestDocument("forum_post", record.id, record.body, {
          thread_id: record.thread_id,
        });
        break;

      case "forum_threads":
        await ingestDocument("forum_thread", record.id, `${record.title}\n\n${record.body}`, {
          category_id: record.category_id,
        });
        break;

      case "product_reviews":
        const reviewContent = [record.title, record.body].filter(Boolean).join("\n\n");
        await ingestDocument("review", record.id, reviewContent, {
          product_id: record.product_id,
          rating: record.rating,
        });
        break;

      case "marketplace_products":
        const productContent = [record.name, record.tagline, record.description]
          .filter(Boolean)
          .join("\n\n");
        await ingestDocument("product", record.id, productContent, {
          vendor_id: record.vendor_id,
        });
        break;
    }
  } catch (error) {
    console.error("Webhook ingestion error:", error);
  }

  return NextResponse.json({ ok: true });
}
