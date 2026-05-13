import { AppShell } from "@/components/app-shell";
import { SettingsPanel } from "@/components/settings-panel";

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="配置模型、工具权限、检索参数和成本上限。"
      rightPanel={false}
    >
      <SettingsPanel />
    </AppShell>
  );
}
