import { NextResponse } from "next/server";

import { listTasks } from "@/lib/store/task-store";

export async function GET() {
  const tasks = await listTasks();

  return NextResponse.json({ tasks });
}
