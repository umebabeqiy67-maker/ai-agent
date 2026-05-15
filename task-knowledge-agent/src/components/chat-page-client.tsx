"use client";

import { useState } from "react";
import { Bot, FileText, Search } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ChatCitation, ChatWorkspace } from "@/components/chat-workspace";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChatPageClient() {
  const [citations, setCitations] = useState<ChatCitation[]>([]);

  return (
    <AppShell
      title="任务与知识库 Agent"
      description="把资料、任务和计划放在同一个 AI 工作台里处理。"
      rightPanelContent={<RagPanel citations={citations} />}
    >
      <ChatWorkspace onCitations={setCitations} />
    </AppShell>
  );
}

function RagPanel({
  citations,
}: Readonly<{
  citations: ChatCitation[];
}>) {
  return (
    <>
      <Panel title="本轮引用资料">
        {citations.length > 0 ? (
          <div className="grid gap-3">
            {citations.map((citation) => (
              <div
                key={citation.id}
                className="rounded-[14px] border border-white/10 bg-white/[.045] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <FileText className="h-4 w-4 shrink-0 text-[#7dd3c7]" />
                      <span className="truncate">{citation.documentName}</span>
                    </div>
                    <div className="mt-1 text-xs text-[#777f90]">
                      chunk {citation.chunkIndex}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-full border-white/10 text-[#a8adba]"
                  >
                    {citation.score}
                  </Badge>
                </div>
                <p className="mt-3 line-clamp-5 text-xs leading-5 text-[#a8adba]">
                  {citation.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyReferenceState />
        )}
      </Panel>

      <Panel title="RAG 状态">
        <div className="grid gap-2 text-xs leading-5 text-[#a8adba]">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.045] px-3 py-2">
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#7dd3c7]" />
              检索 top-k
            </span>
            <span>5</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.045] px-3 py-2">
            <span className="flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-[#b8a1ff]" />
              无资料约束
            </span>
            <span>已启用</span>
          </div>
        </div>
      </Panel>
    </>
  );
}

function EmptyReferenceState() {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[.045] p-3 text-xs leading-5 text-[#a8adba]">
      本轮还没有命中文档 chunk。上传资料后再提问，Agent 会把检索到的片段放进上下文，并在回答里标注来源。
    </div>
  );
}

function Panel({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <Card className="mb-5 rounded-[18px] border-white/10 bg-white/[.05] text-[#f3f0e8]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
