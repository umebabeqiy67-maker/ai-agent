import { NextResponse } from "next/server";

import { evalCases } from "@/lib/evals/cases";
import { runEvalSuite } from "@/lib/evals/runner";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const [latest, runs] = await Promise.all([
    getStore().evalRuns.latest(),
    getStore().evalRuns.list(),
  ]);

  return NextResponse.json({
    cases: evalCases,
    latest,
    runs,
  });
}

export async function POST() {
  const run = await runEvalSuite();

  return NextResponse.json({ run });
}
