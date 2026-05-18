import { executeTool, parseToolArguments, taskToolDefinitions } from "@/lib/agent/tools";
import { createDeepSeekProvider } from "@/lib/ai/providers/deepseek";
import type { ChatMessage, ToolCall } from "@/lib/ai/providers/types";
import { getStore } from "@/lib/store";
import type { SearchResult } from "@/lib/store/types";

export const runtime = "nodejs";

type ChatRequest = {
  conversationId?: string;
  message: string;
  history?: ChatMessage[];
  model?: string;
};

export async function POST(req: Request) {
  try {
    return await handlePost(req);
  } catch (error) {
    return Response.json(
      { error: formatApiError(error) },
      { status: 500 },
    );
  }
}

async function handlePost(req: Request) {
  const body = (await req.json()) as ChatRequest;
  const model = body.model ?? "deepseek-chat";
  const userMessage = body.message.trim();

  if (!userMessage) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const conversationId = body.conversationId ?? "default";
  const store = getStore();
  const startedAt = Date.now();
  const run = await store.agentRuns.create({
    conversationId,
    input: userMessage,
    model,
  });

  try {
    const citations = await store.documents.search({
      query: userMessage,
      topK: 5,
    });

    await store.chat.appendMessage({
      conversationId,
      role: "user",
      content: userMessage,
      model,
    });

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: buildSystemPrompt(citations),
      },
      ...(body.history ?? []).filter((message) => message.content.trim()),
      {
        role: "user",
        content: userMessage,
      },
    ];

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error(
        "DEEPSEEK_API_KEY is not configured. LLM tool calling requires a real provider key.",
      );
    }

    const assistantContent = await runLlmToolCalling({
      model,
      messages,
      runId: run.id,
    });

    await store.chat.appendMessage({
      conversationId,
      role: "assistant",
      content: assistantContent,
      model,
    });

    await store.agentRuns.complete({
      id: run.id,
      status: "success",
      output: assistantContent,
      durationMs: Date.now() - startedAt,
    });

    return textResponse(assistantContent);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown chat error.";
    await store.agentRuns.complete({
      id: run.id,
      status: "error",
      error: message,
      durationMs: Date.now() - startedAt,
    });

    throw error;
  }
}

function buildSystemPrompt(citations: SearchResult[]) {
  const basePrompt =
    "你是一个任务与知识库 Agent。回答要简洁、可执行。你可以通过工具创建、查询和更新真实任务，也可以检索用户上传的文档。用户明确要求记录、安排、提醒、查看或修改任务时调用任务工具。用户问“今天做什么”“今日计划”“帮我安排任务”时，调用 generateDailyPlan。";

  if (citations.length === 0) {
    return [
      basePrompt,
      "本轮没有检索到相关知识库 chunk。用户询问资料、文档、知识库或要求基于资料回答时，必须先说明没有找到相关资料，不要编造来源；如果只是一般问题，可以明确说明未使用知识库后给出通用建议。",
    ].join("\n");
  }

  const ragContext = citations
    .map((citation, index) =>
      [
        `[S${index + 1}] ${citation.documentName} · chunk ${citation.chunkIndex}`,
        citation.content.slice(0, 1200),
      ].join("\n"),
    )
    .join("\n\n");

  return [
    basePrompt,
    "下面是本轮从知识库检索到的资料。优先基于这些资料回答；引用资料时必须写出文档名和 chunkIndex，例如：来源：xxx.md · chunk 2。资料不足时直接说明缺口，不要编造。",
    ragContext,
  ].join("\n\n");
}

function formatApiError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown server error.";

  if (process.env.DATABASE_URL) {
    return message.replaceAll(process.env.DATABASE_URL, "[DATABASE_URL]");
  }

  return message;
}

async function runLlmToolCalling({
  model,
  messages,
  runId,
}: {
  model: string;
  messages: ChatMessage[];
  runId: string;
}) {
  const provider = createDeepSeekProvider();
  const firstCompletion = await provider.createChatCompletion({
    model,
    messages,
    tools: taskToolDefinitions,
    tool_choice: "auto",
  });
  const assistantMessage = firstCompletion.choices[0]?.message;

  if (!assistantMessage) {
    throw new Error("LLM returned no assistant message.");
  }

  const toolCalls = assistantMessage.tool_calls ?? [];

  if (toolCalls.length === 0) {
    return assistantMessage.content || "";
  }

  const toolMessages: ChatMessage[] = [];

  for (const toolCall of toolCalls) {
    const toolResult = await executeLlmToolCall(toolCall, runId);
    toolMessages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(toolResult),
    });
  }

  const secondCompletion = await provider.createChatCompletion({
    model,
    messages: [
      ...messages,
      {
        role: "assistant",
        content: assistantMessage.content || "",
        tool_calls: toolCalls,
      },
      ...toolMessages,
    ],
    tools: taskToolDefinitions,
    tool_choice: "none",
  });

  const finalContent = secondCompletion.choices[0]?.message?.content;

  if (finalContent?.trim()) {
    return finalContent;
  }

  return formatToolCallsFallback(toolCalls);
}

async function executeLlmToolCall(toolCall: ToolCall, runId: string) {
  const rawArguments = parseToolArguments(toolCall.function.arguments);
  return executeTool(toolCall.function.name, rawArguments, { runId });
}

function textResponse(content: string) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(content));
        controller.close();
      },
    }),
    {
      headers: responseHeaders(),
    },
  );
}

function responseHeaders() {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
  };
}

function formatToolCallsFallback(toolCalls: ToolCall[]) {
  return [
    "工具调用已完成：",
    "",
    ...toolCalls.map((toolCall) => `- ${toolCall.function.name}`),
  ].join("\n");
}
