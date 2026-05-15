import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export async function GET() {
  const data = await getStore().chat.getCurrentConversation();

  return NextResponse.json(data);
}
