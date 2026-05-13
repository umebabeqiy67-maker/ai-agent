"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ToolCall = {
  id: string;
  name: string;
  arguments: unknown;
  result?: unknown;
  status: "success" | "error";
  error?: string;
  createdAt: string;
};

export function ToolCallsPanel() {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  useEffect(() => {
    async function loadToolCalls() {
      const response = await fetch("/api/tool-calls", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { toolCalls: ToolCall[] };
      setToolCalls(data.toolCalls);
    }

    loadToolCalls();
  }, []);

  const selected = toolCalls[0];

  return (
    <div className="grid gap-5 p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
        <CardHeader>
          <CardTitle className="text-sm">工具调用记录</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {toolCalls.length > 0 ? (
            toolCalls.map((toolCall) => (
              <div
                key={toolCall.id}
                className="rounded-[16px] border border-white/10 bg-white/[.045] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {toolCall.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-[#a3e635]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-[#f6c76f]" />
                      )}
                      {toolCall.name}
                    </div>
                    <p className="mt-1 text-xs text-[#a8adba]">
                      {new Date(toolCall.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-white/10 text-[#a8adba]"
                  >
                    {toolCall.status}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="gap-1 rounded-full bg-[#7dd3c7]/15 text-[#7dd3c7] hover:bg-[#7dd3c7]/15">
                    <Wrench className="h-3.5 w-3.5" />
                    tool
                  </Badge>
                  <Badge
                    variant="outline"
                    className="gap-1 rounded-full border-white/10 text-[#a8adba]"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    saved
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[16px] border border-dashed border-white/10 p-5 text-sm text-[#777f90]">
              还没有 tool_calls。去 Chat 里说：明天下午提醒我整理项目计划。
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
        <CardHeader>
          <CardTitle className="text-sm">Tool Call Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {selected ? (
            <pre className="max-h-[620px] overflow-auto whitespace-pre-wrap rounded-[16px] border border-[#7dd3c7]/20 bg-[#7dd3c7]/[.075] p-4 text-xs leading-5 text-[#d7f8f3]">
              {JSON.stringify(selected, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-[#a8adba]">
              执行工具调用后，这里会展示参数、结果和错误信息。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
