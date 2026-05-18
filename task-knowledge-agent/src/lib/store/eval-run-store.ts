import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { StoredEvalRun } from "@/lib/store/types";

type EvalRunStoreData = {
  runs: StoredEvalRun[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "eval-runs.json");

export async function saveEvalRun(input: Omit<StoredEvalRun, "id" | "createdAt">) {
  const store = await readStore();
  const run: StoredEvalRun = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  store.runs.unshift(run);
  await writeStore(store);

  return run;
}

export async function getLatestEvalRun() {
  const store = await readStore();
  return store.runs[0] ?? null;
}

export async function listEvalRuns() {
  const store = await readStore();
  return store.runs;
}

async function readStore(): Promise<EvalRunStoreData> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as EvalRunStoreData;
  } catch {
    return { runs: [] };
  }
}

async function writeStore(store: EvalRunStoreData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}
