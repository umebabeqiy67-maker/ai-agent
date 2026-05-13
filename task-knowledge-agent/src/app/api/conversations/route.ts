import { NextResponse } from "next/server";

import { getCurrentConversation } from "@/lib/store/chat-store";

export async function GET() {
  const data = await getCurrentConversation();

  return NextResponse.json(data);
}
