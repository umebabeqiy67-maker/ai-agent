"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  BrainCircuit,
  ClipboardList,
  Database,
  FileText,
  MessageSquareText,
  MoreHorizontal,
  Settings,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Chat", href: "/", count: "12", icon: MessageSquareText },
  { label: "Documents", href: "/documents", count: "8", icon: FileText },
  { label: "Tasks", href: "/tasks", count: "23", icon: ClipboardList },
  { label: "Agent Runs", href: "/agent-runs", count: "41", icon: Activity },
  { label: "Settings", href: "/settings", count: "", icon: Settings },
];

const tasks = [
  {
    title: "初始化 Agent Starter Kit",
    meta: "High · 今天 · 来自开发计划",
    status: "In progress",
  },
  {
    title: "定义工具调用 schema",
    meta: "High · 今天 · createTask / searchDocs",
    status: "Queued",
  },
  {
    title: "搭建 Agent Runs 调试台",
    meta: "Medium · 本周 · 可追踪每一步",
    status: "Queued",
  },
];

const citations = [
  "07-task-knowledge-agent-dev-plan.md · MVP 范围和工具列表",
  "09-fast-ai-agent-production-plan.md · Starter Kit 复用策略",
  "08-ui-skill-and-design-recommendations.md · UI skills 与视觉方向",
];

const runs = [
  { tool: "searchDocs", time: "128ms" },
  { tool: "createTask", time: "84ms" },
  { tool: "generateDailyPlan", time: "611ms" },
];

export function AppShell({
  title,
  description,
  children,
  rightPanel = true,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
  rightPanel?: boolean;
}>) {
  const pathname = usePathname();

  return (
    <main className="h-screen overflow-hidden bg-[#0f1115] text-[#f3f0e8]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(125,211,199,.14),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(184,161,255,.13),transparent_30%),linear-gradient(135deg,#0f1115_0%,#13161d_48%,#101318_100%)]" />

      <div
        className={`relative grid h-screen min-h-0 ${
          rightPanel
            ? "grid-cols-[260px_minmax(520px,1fr)_360px] max-[1120px]:grid-cols-[86px_minmax(0,1fr)]"
            : "grid-cols-[260px_minmax(520px,1fr)] max-[1120px]:grid-cols-[86px_minmax(0,1fr)]"
        } max-[720px]:grid-cols-1`}
      >
        <aside className="min-h-0 overflow-auto border-r border-white/10 bg-[#111319]/85 px-4 py-5 backdrop-blur-xl max-[720px]:hidden">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-gradient-to-br from-[#7dd3c7] to-[#b8a1ff] shadow-[0_12px_35px_rgba(125,211,199,.22)]">
              <BrainCircuit className="h-5 w-5 text-[#111318]" />
            </div>
            <div className="max-[1120px]:hidden">
              <div className="text-sm font-semibold">Agent Workspace</div>
              <div className="text-xs text-[#a8adba]">Tasks + Knowledge</div>
            </div>
          </div>

          <nav className="grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Button
                  asChild
                  key={item.href}
                  variant="ghost"
                  className={`h-11 justify-between rounded-xl border px-3 text-sm max-[1120px]:justify-center ${
                    active
                      ? "border-white/10 bg-white/[.075] text-[#f3f0e8] hover:bg-white/[.1] hover:text-[#f3f0e8]"
                      : "border-transparent text-[#a8adba] hover:bg-white/[.045] hover:text-[#f3f0e8]"
                  }`}
                >
                  <Link href={item.href}>
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="max-[1120px]:hidden">{item.label}</span>
                    </span>
                    <span className="text-xs text-[#777f90] max-[1120px]:hidden">
                      {item.count}
                    </span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          <Card className="mt-8 rounded-[18px] border-white/10 bg-white/[.055] text-[#f3f0e8] max-[1120px]:hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-[#7dd3c7]" />
                今日状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-6 text-[#a8adba]">
                3 个任务待安排，2 份文档已完成索引。Agent 本轮使用
                DeepSeek Chat。
              </p>
            </CardContent>
          </Card>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col bg-[#0f1115]/45">
          <header className="shrink-0 flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5 max-[720px]:items-start max-[720px]:flex-col">
            <div>
              <h1 className="text-lg font-semibold tracking-normal">{title}</h1>
              <p className="mt-1 text-sm text-[#a8adba]">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-2 rounded-full border-white/10 bg-white/[.055] px-3 py-2 text-[#a8adba] hover:bg-white/[.055]">
                <span className="h-2 w-2 rounded-full bg-[#a3e635] shadow-[0_0_0_4px_rgba(163,230,53,.11)]" />
                Ready
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-white/10 bg-white/[.055] px-3 py-2 text-[#a8adba]"
              >
                DeepSeek Chat
              </Badge>
              <Badge
                variant="outline"
                className="gap-2 rounded-full border-white/10 bg-white/[.055] px-3 py-2 text-[#a8adba]"
              >
                <Database className="h-3.5 w-3.5" />
                pgvector
              </Badge>
            </div>
          </header>

          {children}
        </section>

        {rightPanel ? (
          <aside className="overflow-auto border-l border-white/10 bg-[#111319]/85 p-5 backdrop-blur-xl max-[1120px]:hidden">
            <SidePanel title="今日任务">
              <div className="grid gap-3">
                {tasks.map((task) => (
                  <Card
                    key={task.title}
                    className="rounded-[14px] border-white/10 bg-white/[.045] text-[#f3f0e8]"
                  >
                    <CardContent className="p-3">
                      <div className="text-sm font-semibold">{task.title}</div>
                      <div className="mt-1 text-xs leading-5 text-[#a8adba]">
                        {task.meta}
                      </div>
                      <Badge
                        variant="outline"
                        className="mt-3 rounded-full border-white/10 text-[#a8adba]"
                      >
                        {task.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SidePanel>

            <SidePanel title="引用资料">
              <div className="grid gap-3">
                {citations.map((citation, index) => (
                  <div key={citation}>
                    {index > 0 ? (
                      <Separator className="mb-3 bg-white/10" />
                    ) : null}
                    <p className="text-xs leading-5 text-[#a8adba]">
                      {citation}
                    </p>
                  </div>
                ))}
              </div>
            </SidePanel>

            <SidePanel title="最近 Agent Runs">
              <div className="grid gap-2">
                {runs.map((run) => (
                  <div
                    key={run.tool}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.045] px-3 py-2 text-xs text-[#a8adba]"
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="h-3.5 w-3.5 text-[#7dd3c7]" />
                      {run.tool}
                    </span>
                    <span>{run.time}</span>
                  </div>
                ))}
              </div>
            </SidePanel>
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function SidePanel({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <Card className="mb-5 rounded-[18px] border-white/10 bg-white/[.05] text-[#f3f0e8]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          {title}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-[#a8adba] hover:bg-white/[.06] hover:text-[#f3f0e8]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
