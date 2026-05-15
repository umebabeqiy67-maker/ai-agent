import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export async function GET() {
  const toolCalls = await getStore().toolCalls.list();

  return NextResponse.json({ toolCalls });
}
