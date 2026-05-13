import { NextResponse } from "next/server";

import { listToolCalls } from "@/lib/store/tool-call-store";

export async function GET() {
  const toolCalls = await listToolCalls();

  return NextResponse.json({ toolCalls });
}
