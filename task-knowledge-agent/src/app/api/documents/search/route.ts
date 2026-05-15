import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export async function POST(req: Request) {
  const body = (await req.json()) as { query?: string; topK?: number };

  if (!body.query?.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const results = await getStore().documents.search({
    query: body.query,
    topK: body.topK,
  });

  return NextResponse.json({ results });
}
