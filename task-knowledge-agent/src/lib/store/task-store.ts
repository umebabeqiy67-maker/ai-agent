import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type StoredTask = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  source: "agent" | "manual";
  sourceMessage?: string;
  createdAt: string;
  updatedAt: string;
};

type TaskStoreData = {
  tasks: StoredTask[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "tasks.json");

export async function createTask(input: {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  sourceMessage?: string;
}) {
  const store = await readStore();
  const now = new Date().toISOString();
  const task: StoredTask = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    status: "todo",
    priority: input.priority ?? "medium",
    dueDate: input.dueDate,
    source: "agent",
    sourceMessage: input.sourceMessage,
    createdAt: now,
    updatedAt: now,
  };

  store.tasks.unshift(task);
  await writeStore(store);

  return task;
}

export async function listTasks(filter?: { status?: TaskStatus }) {
  const store = await readStore();

  if (filter?.status) {
    return store.tasks.filter((task) => task.status === filter.status);
  }

  return store.tasks;
}

export async function updateTask(input: {
  id: string;
  status?: TaskStatus;
  title?: string;
  priority?: TaskPriority;
}) {
  const store = await readStore();
  const task = store.tasks.find((item) => item.id === input.id);

  if (!task) {
    throw new Error(`Task not found: ${input.id}`);
  }

  task.status = input.status ?? task.status;
  task.title = input.title ?? task.title;
  task.priority = input.priority ?? task.priority;
  task.updatedAt = new Date().toISOString();

  await writeStore(store);
  return task;
}

async function readStore(): Promise<TaskStoreData> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as TaskStoreData;
  } catch {
    return { tasks: [] };
  }
}

async function writeStore(store: TaskStoreData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}
