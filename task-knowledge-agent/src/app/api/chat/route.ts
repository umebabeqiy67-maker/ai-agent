import { executeTool, parseToolArguments, taskToolDefinitions } from "@/lib/agent/tools";
import { createDeepSeekProvider } from "@/lib/ai/providers/deepseek";
import type { ChatMessage, ToolCall } from "@/lib/ai/providers/types";
import { appendMessage } from "@/lib/store/chat-store";

export const runtime = "nodejs";

type ChatRequest = {
  conversationId?: string;
  message: string;
  history?: ChatMessage[];
  model?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;
  const model = body.model ?? "deepseek-chat";
  const userMessage = body.message.trim();

  if (!userMessage) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const conversationId = body.conversationId ?? "default";
  await appendMessage({
    conversationId,
    role: "user",
    content: userMessage,
    model,
  });

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "你是一个任务与知识库 Agent。回答要简洁、可执行。你可以通过工具创建、查询和更新真实任务，也可以检索用户上传的文档。用户询问资料、文档、知识库、计划内容时，优先调用 searchDocs；用户明确要求记录、安排、提醒、查看或修改任务时调用任务工具。基于文档回答时要引用文档名和 chunkIndex。",
    },
    ...(body.history ?? []).filter((message) => message.content.trim()),
    {
      role: "user",
      content: userMessage,
    },
  ];

  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json(
      {
        error:
          "DEEPSEEK_API_KEY is not configured. LLM tool calling requires a real provider key.",
      },
      { status: 500 },
    );
  }

  const assistantContent = await runLlmToolCalling({
    model,
    messages,
  });

  await appendMessage({
    conversationId,
    role: "assistant",
    content: assistantContent,
    model,
  });

  return textResponse(assistantContent);
}

async function runLlmToolCalling({
  model,
  messages,
}: {
  model: string;
  messages: ChatMessage[];
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
    const toolResult = await executeLlmToolCall(toolCall);
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

async function executeLlmToolCall(toolCall: ToolCall) {
  const rawArguments = parseToolArguments(toolCall.function.arguments);
  return executeTool(toolCall.function.name, rawArguments);
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
