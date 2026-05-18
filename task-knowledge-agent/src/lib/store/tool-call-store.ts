import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredToolCall = {
  id: string;
  runId?: string;
  name: string;
  arguments: unknown;
  result?: unknown;
  status: "success" | "error";
  error?: string;
  durationMs?: number;
  createdAt: string;
};

type ToolCallStoreData = {
  toolCalls: StoredToolCall[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "tool-calls.json");

export async function saveToolCall(input: Omit<StoredToolCall, "id" | "createdAt">) {
  const store = await readStore();
  const toolCall: StoredToolCall = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  store.toolCalls.unshift(toolCall);
  await writeStore(store);

  return toolCall;
}

export async function listToolCalls() {
  const store = await readStore();
  return store.toolCalls;
}

async function readStore(): Promise<ToolCallStoreData> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as ToolCallStoreData;
  } catch {
    return { toolCalls: [] };
  }
}

async function writeStore(store: ToolCallStoreData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}
