import { AppShell } from "@/components/app-shell";
import { TasksBoard } from "@/components/tasks-board";

export default function TasksPage() {
  return (
    <AppShell
      title="Tasks"
      description="让 Agent 把对话里的目标落成真实任务，而不是只给建议。"
    >
      <TasksBoard />
    </AppShell>
  );
}
