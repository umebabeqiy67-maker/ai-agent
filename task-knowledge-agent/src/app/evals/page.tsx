import { AppShell } from "@/components/app-shell";
import { EvalsPanel } from "@/components/evals-panel";

export default function EvalsPage() {
  return (
    <AppShell
      title="Evals"
      description="用固定样例评估工具选择、RAG 检索和失败案例。"
    >
      <EvalsPanel />
    </AppShell>
  );
}
