import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { listTasks } from "@/lib/store/task-store";
import type { StoredDailyPlan, StoredTask } from "@/lib/store/types";

type DailyPlanStoreData = {
  plans: StoredDailyPlan[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "daily-plans.json");

export async function generateDailyPlan(input?: { date?: string }) {
  const store = await readStore();
  const date = input?.date ?? getTodayDate();
  const tasks = await listTasks();
  const items = buildDailyPlanItems(tasks, date);
  const plan = {
    ...buildDailyPlan(date, items),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  store.plans.unshift(plan);
  await writeStore(store);

  return plan;
}

export async function getLatestDailyPlan() {
  const store = await readStore();
  return store.plans[0] ?? null;
}

function buildDailyPlanItems(tasks: StoredTask[], date: string) {
  const candidates = tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => scoreTask(b, date) - scoreTask(a, date))
    .slice(0, 6);

  const slots = ["09:30", "10:30", "14:00", "15:30", "17:00", "20:00"];

  return candidates.map((task, index) => ({
    taskId: task.id,
    title: task.title,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    slot: slots[index] ?? "待安排",
    rationale: getTaskRationale(task, date),
  }));
}

function buildDailyPlan(date: string, items: StoredDailyPlan["items"]) {
  const highCount = items.filter((item) => item.priority === "high").length;
  const overdueCount = items.filter((item) => item.dueDate && item.dueDate < date).length;

  return {
    date,
    title: `${date} 今日计划`,
    summary:
      items.length === 0
        ? "当前没有待办任务，可以补充任务后再生成计划。"
        : `安排 ${items.length} 个任务，其中 ${highCount} 个高优先级，${overdueCount} 个已逾期。`,
    items,
  };
}

function scoreTask(task: StoredTask, date: string) {
  const priorityScore = { high: 30, medium: 20, low: 10 }[task.priority];
  const statusScore = task.status === "in_progress" ? 8 : 0;
  const dueScore = task.dueDate
    ? task.dueDate < date
      ? 30
      : task.dueDate === date
        ? 24
        : 8
    : 0;

  return priorityScore + statusScore + dueScore;
}

function getTaskRationale(task: StoredTask, date: string) {
  if (task.dueDate && task.dueDate < date) {
    return "已逾期，优先处理。";
  }

  if (task.dueDate === date) {
    return "今天到期，放进今日计划。";
  }

  if (task.priority === "high") {
    return "高优先级任务，优先安排。";
  }

  if (task.status === "in_progress") {
    return "正在推进中，适合继续完成。";
  }

  return "按优先级和待办顺序安排。";
}

function getTodayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function readStore(): Promise<DailyPlanStoreData> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as DailyPlanStoreData;
  } catch {
    return { plans: [] };
  }
}

async function writeStore(store: DailyPlanStoreData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}
