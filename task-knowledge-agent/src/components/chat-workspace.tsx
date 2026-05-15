"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, CheckCircle2, Loader2, Search, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
};

type StoredMessage = UiMessage & {
  conversationId: string;
  createdAt: string;
};

export function ChatWorkspace() {
  const [conversationId, setConversationId] = useState("default");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadConversation() {
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        conversation: { id: string };
        messages: StoredMessage[];
      };

      if (!ignore) {
        setConversationId(data.conversation.id);
        setMessages(
          data.messages.map((message) => ({
            id: message.id,
            role: message.role === "assistant" ? "assistant" : "user",
            content: message.content,
            model: message.model,
          })),
        );
      }
    }

    loadConversation();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const history = useMemo(
    () =>
      messages.slice(-12).map((message) => ({
        role: message.role,
        content: message.content,
      })),
    [messages],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextMessage = input.trim();

    if (!nextMessage || isLoading) {
      return;
    }

    const userMessage: UiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: nextMessage,
    };
    const assistantMessage: UiMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      model: "deepseek-chat",
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          message: nextMessage,
          history,
          model: "deepseek-chat",
        }),
      });

      if (!response.ok || !response.body) {
        let errorMessage = "Chat request failed.";

        try {
          const errorBody = (await response.json()) as { error?: string };
          errorMessage = errorBody.error ?? errorMessage;
        } catch {
          // Keep the generic message when the server did not return JSON.
        }

        throw new Error(errorMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const token = decoder.decode(value, { stream: true });

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: message.content + token }
              : message,
          ),
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown chat error.";

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: `请求失败：${errorMessage}` }
            : message,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-6 py-5">
          {hasMessages ? (
            messages.map((message) => (
              <ChatMessage key={message.id} role={message.role}>
                {message.content ||
                  (message.role === "assistant" ? "正在思考..." : "")}
              </ChatMessage>
            ))
          ) : (
            <EmptyChat />
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <footer className="shrink-0 border-t border-white/10 px-6 py-5">
        <Card className="rounded-[20px] border-white/10 bg-white/[.07] shadow-[0_22px_70px_rgba(0,0,0,.35)]">
          <CardContent className="p-3">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-[1fr_auto] gap-3"
            >
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                className="min-h-12 resize-none border-0 bg-transparent px-3 py-2 text-sm text-[#f3f0e8] shadow-none outline-none placeholder:text-[#777f90] focus-visible:ring-0"
                placeholder="输入目标，例如：把这份文档拆成任务，或者基于我的待办生成今日计划"
              />
              <Button
                type="submit"
                disabled={isLoading}
                aria-label="发送给 Agent"
                className="self-end rounded-[14px] bg-gradient-to-br from-[#7dd3c7] to-[#d9f99d] px-4 py-3 text-sm font-bold text-[#111318] hover:brightness-105 disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                发送
              </Button>
            </form>
          </CardContent>
        </Card>
      </footer>
    </>
  );
}

function EmptyChat() {
  return (
    <ChatMessage role="assistant">
      <p className="text-sm leading-7 text-[#eeeef2]">
        LLM tool calling 已接通。请先配置 DEEPSEEK_API_KEY，然后我会通过
        DeepSeek 判断是否调用 createTask、listTasks 或 updateTask。
      </p>

      <ToolCard
        icon={<Search className="h-4 w-4" />}
        tone="mint"
        title="Provider adapter ready"
        description="当前工具调用只走真实 LLM provider，不再使用本地规则 fallback。"
      />

      <ToolCard
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="violet"
        title="Messages persisted"
        description="当前阶段使用 data/chat-store.json 保存 conversations 和 messages。"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {["streaming", "messages", "conversations"].map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="rounded-full border-white/10 bg-white/[.055] px-3 py-1.5 text-[#a8adba]"
          >
            {item}
          </Badge>
        ))}
      </div>
    </ChatMessage>
  );
}

function ChatMessage({
  role,
  children,
}: Readonly<{
  role: "user" | "assistant";
  children: React.ReactNode;
}>) {
  const isAgent = role === "assistant";

  return (
    <article
      className={`mb-3 flex items-start gap-3 ${
        isAgent ? "justify-start" : "justify-end"
      }`}
    >
      {isAgent ? (
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#7dd3c7] text-sm font-bold text-[#111318] max-[720px]:hidden">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}
      <Card
        className={`max-w-[min(680px,72%)] rounded-[16px] border text-[#f3f0e8] shadow-[0_10px_30px_rgba(0,0,0,.12)] max-[720px]:max-w-[86%] ${
          isAgent
            ? "border-white/10 bg-white/[.055]"
            : "border-[#7dd3c7]/25 bg-[#7dd3c7]/[.09]"
        }`}
      >
        <CardContent className="px-3.5 py-2.5">
          {typeof children === "string" ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-[#eeeef2]">
              {children}
            </p>
          ) : (
            children
          )}
        </CardContent>
      </Card>
      {!isAgent ? (
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-[#252a35] text-xs font-bold text-[#f3f0e8] max-[720px]:hidden">
          你
        </div>
      ) : null}
    </article>
  );
}

function ToolCard({
  icon,
  tone,
  title,
  description,
}: Readonly<{
  icon: React.ReactNode;
  tone: "mint" | "violet";
  title: string;
  description: string;
}>) {
  const toneClass =
    tone === "mint"
      ? "border-[#7dd3c7]/20 bg-[#7dd3c7]/[.075]"
      : "border-[#b8a1ff]/20 bg-[#b8a1ff]/[.075]";

  return (
    <div className={`mt-4 rounded-[14px] border p-3 ${toneClass}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="mt-1 text-xs leading-5 text-[#a8adba]">{description}</div>
    </div>
  );
}
