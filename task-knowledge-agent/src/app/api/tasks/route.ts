import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export async function GET() {
  const tasks = await getStore().tasks.list();

  return NextResponse.json({ tasks });
}
