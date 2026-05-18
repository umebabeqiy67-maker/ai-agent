"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BrainCircuit,
  ClipboardList,
  Database,
  FileText,
  FlaskConical,
  MessageSquareText,
  Settings,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Chat", href: "/", icon: MessageSquareText },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Tasks", href: "/tasks", icon: ClipboardList },
  { label: "Agent Runs", href: "/agent-runs", icon: Activity },
  { label: "Evals", href: "/evals", icon: FlaskConical },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({
  title,
  description,
  children,
  rightPanel = false,
  rightPanelContent,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
  rightPanel?: boolean;
  rightPanelContent?: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showRightPanel = rightPanel || Boolean(rightPanelContent);

  return (
    <main className="h-screen overflow-hidden bg-[#0f1115] text-[#f3f0e8]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(125,211,199,.14),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(184,161,255,.13),transparent_30%),linear-gradient(135deg,#0f1115_0%,#13161d_48%,#101318_100%)]" />

      <div
        className={`relative grid h-screen min-h-0 ${
          showRightPanel
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
                  </Link>
                </Button>
              );
            })}
          </nav>
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

        {showRightPanel ? (
          <aside className="overflow-auto border-l border-white/10 bg-[#111319]/85 p-5 backdrop-blur-xl max-[1120px]:hidden">
            {rightPanelContent}
          </aside>
        ) : null}
      </div>
    </main>
  );
}
