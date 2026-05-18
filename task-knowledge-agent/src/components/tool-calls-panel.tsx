"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  TerminalSquare,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ToolCall = {
  id: string;
  runId?: string;
  name: string;
  arguments: unknown;
  result?: unknown;
  status: "success" | "error";
  error?: string;
  durationMs?: number;
  createdAt: string;
};

type AgentRun = {
  id: string;
  conversationId: string;
  input: string;
  model: string;
  status: "running" | "success" | "error";
  output?: string;
  error?: string;
  durationMs?: number;
  createdAt: string;
  completedAt?: string;
  toolCalls: ToolCall[];
};

export function ToolCallsPanel() {
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadAgentRuns() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent-runs", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { agentRuns: AgentRun[] };
      setAgentRuns(data.agentRuns);
      setSelectedId((current) => current ?? data.agentRuns[0]?.id ?? null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAgentRuns();
  }, []);

  const selected = useMemo(
    () => agentRuns.find((run) => run.id === selectedId) ?? agentRuns[0],
    [agentRuns, selectedId],
  );

  return (
    <div className="grid min-h-0 gap-5 overflow-auto p-6 xl:grid-cols-[minmax(0,1fr)_520px]">
      <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-sm">Agent Runs</CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={loadAgentRuns}
            disabled={isLoading}
            className="rounded-[14px] border-white/10 bg-white/[.045] text-[#f3f0e8] hover:bg-white/[.075]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            刷新
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {agentRuns.length > 0 ? (
            agentRuns.map((run) => (
              <button
                key={run.id}
                type="button"
                onClick={() => setSelectedId(run.id)}
                className={`rounded-[16px] border p-4 text-left transition-colors ${
                  selected?.id === run.id
                    ? "border-[#7dd3c7]/35 bg-[#7dd3c7]/[.075]"
                    : "border-white/10 bg-white/[.045] hover:bg-white/[.07]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <RunStatusIcon status={run.status} />
                      <span className="truncate">{run.input}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#a8adba]">
                      {new Date(run.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-white/10 text-[#a8adba]"
                  >
                    {run.status}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="gap-1 rounded-full bg-[#7dd3c7]/15 text-[#7dd3c7] hover:bg-[#7dd3c7]/15">
                    <Wrench className="h-3.5 w-3.5" />
                    {run.toolCalls.length} tools
                  </Badge>
                  <Badge
                    variant="outline"
                    className="gap-1 rounded-full border-white/10 text-[#a8adba]"
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDuration(run.durationMs)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-white/10 text-[#a8adba]"
                  >
                    {run.model}
                  </Badge>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-[16px] border border-dashed border-white/10 p-5 text-sm text-[#777f90]">
              还没有 Agent Run。去 Chat 里问“今天我该做什么”，这里会记录完整执行过程。
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TerminalSquare className="h-4 w-4 text-[#7dd3c7]" />
            Run Detail
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selected ? (
            <RunDetail run={selected} />
          ) : (
            <p className="text-sm text-[#a8adba]">
              选择一次 run 后，这里会展示输入、输出、工具参数、工具结果和错误。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RunDetail({ run }: Readonly<{ run: AgentRun }>) {
  return (
    <div className="grid gap-4">
      <DetailBlock title="用户输入" value={run.input} />
      {run.output ? <DetailBlock title="最终回答" value={run.output} /> : null}
      {run.error ? <DetailBlock title="错误" value={run.error} tone="error" /> : null}

      <div>
        <div className="mb-2 text-xs font-semibold text-[#a8adba]">
          工具调用
        </div>
        <div className="grid gap-3">
          {run.toolCalls.length > 0 ? (
            run.toolCalls.map((toolCall) => (
              <div
                key={toolCall.id}
                className="rounded-[16px] border border-white/10 bg-[#111319]/70 p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {toolCall.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#a3e635]" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-[#f6c76f]" />
                    )}
                    {toolCall.name}
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/10 text-[#a8adba]"
                    >
                      {toolCall.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/10 text-[#a8adba]"
                    >
                      {formatDuration(toolCall.durationMs)}
                    </Badge>
                  </div>
                </div>
                <JsonBlock title="arguments" value={toolCall.arguments} />
                {toolCall.result !== undefined ? (
                  <JsonBlock title="result" value={toolCall.result} />
                ) : null}
                {toolCall.error ? (
                  <DetailBlock title="error" value={toolCall.error} tone="error" />
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-[16px] border border-dashed border-white/10 p-4 text-sm text-[#777f90]">
              这次回答没有调用工具。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailBlock({
  title,
  value,
  tone = "default",
}: Readonly<{
  title: string;
  value: string;
  tone?: "default" | "error";
}>) {
  const toneClass =
    tone === "error"
      ? "border-red-400/20 bg-red-500/[.075] text-red-100"
      : "border-[#7dd3c7]/20 bg-[#7dd3c7]/[.075] text-[#d7f8f3]";

  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-[#a8adba]">{title}</div>
      <pre
        className={`max-h-[260px] overflow-auto whitespace-pre-wrap rounded-[16px] border p-4 text-xs leading-5 ${toneClass}`}
      >
        {value}
      </pre>
    </div>
  );
}

function JsonBlock({
  title,
  value,
}: Readonly<{
  title: string;
  value: unknown;
}>) {
  return <DetailBlock title={title} value={JSON.stringify(value, null, 2)} />;
}

function RunStatusIcon({
  status,
}: Readonly<{
  status: AgentRun["status"];
}>) {
  if (status === "success") {
    return <CheckCircle2 className="h-4 w-4 text-[#a3e635]" />;
  }

  if (status === "error") {
    return <AlertCircle className="h-4 w-4 text-[#f6c76f]" />;
  }

  return <Loader2 className="h-4 w-4 animate-spin text-[#7dd3c7]" />;
}

function formatDuration(value?: number) {
  if (value === undefined) {
    return "pending";
  }

  if (value < 1000) {
    return `${value}ms`;
  }

  return `${(value / 1000).toFixed(1)}s`;
}
