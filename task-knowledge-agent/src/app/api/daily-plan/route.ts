import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const plan = await getStore().dailyPlans.latest();

  return NextResponse.json({ plan });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { date?: string };
  const plan = await getStore().dailyPlans.generate({
    date: body.date,
  });

  return NextResponse.json({ plan });
}
