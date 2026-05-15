import { AppShell } from "@/components/app-shell";
import { DocumentsPanel } from "@/components/documents-panel";

export default function DocumentsPage() {
  return (
    <AppShell
      title="Documents"
      description="上传资料、查看解析状态，并验证 Agent 能检索到的上下文。"
    >
      <DocumentsPanel />
    </AppShell>
  );
}
