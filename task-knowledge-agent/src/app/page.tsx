import { AppShell } from "@/components/app-shell";
import { ChatWorkspace } from "@/components/chat-workspace";

export default function ChatPage() {
  return (
    <AppShell
      title="任务与知识库 Agent"
      description="把资料、任务和计划放在同一个 AI 工作台里处理。"
    >
      <ChatWorkspace />
    </AppShell>
  );
}
