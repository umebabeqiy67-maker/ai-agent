import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const agentRuns = await getStore().agentRuns.list();

  return NextResponse.json({ agentRuns });
}
