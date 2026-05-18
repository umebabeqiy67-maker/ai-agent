import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { listToolCalls } from "@/lib/store/tool-call-store";
import type { StoredAgentRun, StoredAgentRunWithToolCalls } from "@/lib/store/types";

type AgentRunStoreData = {
  runs: StoredAgentRun[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "agent-runs.json");

export async function createAgentRun(input: {
  conversationId: string;
  input: string;
  model: string;
}) {
  const store = await readStore();
  const run: StoredAgentRun = {
    id: crypto.randomUUID(),
    conversationId: input.conversationId,
    input: input.input,
    model: input.model,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  store.runs.unshift(run);
  await writeStore(store);

  return run;
}

export async function completeAgentRun(input: {
  id: string;
  status: "success" | "error";
  output?: string;
  error?: string;
  durationMs: number;
}) {
  const store = await readStore();
  const run = store.runs.find((item) => item.id === input.id);

  if (!run) {
    throw new Error(`Agent run not found: ${input.id}`);
  }

  run.status = input.status;
  run.output = input.output;
  run.error = input.error;
  run.durationMs = input.durationMs;
  run.completedAt = new Date().toISOString();
  await writeStore(store);

  return run;
}

export async function listAgentRuns(): Promise<StoredAgentRunWithToolCalls[]> {
  const store = await readStore();
  const toolCalls = await listToolCalls();

  return store.runs.map((run) => ({
    ...run,
    toolCalls: toolCalls.filter((toolCall) => toolCall.runId === run.id),
  }));
}

async function readStore(): Promise<AgentRunStoreData> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as AgentRunStoreData;
  } catch {
    return { runs: [] };
  }
}

async function writeStore(store: AgentRunStoreData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}
