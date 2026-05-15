import { NextResponse } from "next/server";

import { searchDocuments } from "@/lib/store/document-store";

export async function POST(req: Request) {
  const body = (await req.json()) as { query?: string; topK?: number };

  if (!body.query?.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const results = await searchDocuments({
    query: body.query,
    topK: body.topK,
  });

  return NextResponse.json({ results });
}
