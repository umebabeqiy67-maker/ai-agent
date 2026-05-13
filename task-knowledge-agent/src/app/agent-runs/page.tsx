import { AppShell } from "@/components/app-shell";
import { ToolCallsPanel } from "@/components/tool-calls-panel";

export default function AgentRunsPage() {
  return (
    <AppShell
      title="Agent Runs"
      description="追踪每一次 Agent 决策、工具调用、参数和结果。"
      rightPanel={false}
    >
      <ToolCallsPanel />
    </AppShell>
  );
}
