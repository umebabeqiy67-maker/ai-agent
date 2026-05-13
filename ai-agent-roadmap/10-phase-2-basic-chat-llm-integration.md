# 第 2 阶段：基础聊天与 LLM 接入说明

## 1. 这一阶段要做什么

第 2 阶段的目标不是“做一个输入框调用模型”这么简单，而是搭出后续所有 Agent 都会复用的 LLM 调用底座。

要完成：

- 接入一个 LLM provider
- 支持流式输出
- 保存 conversations
- 保存 messages
- 做 provider adapter，方便后续切换 DeepSeek、OpenAI-compatible、Gemini
- 为第 3 阶段的工具调用预留 message 格式

## 2. LLM 应该接在哪里

对当前项目，建议先接在 Next.js 后端里，也就是：

```text
src/app/api/chat/route.ts
```

原因：

- 你熟悉前端，Next.js Route Handler 上手最快。
- 第一版只需要跑通聊天、流式输出、消息保存，不需要复杂 Python 管线。
- API Key 可以放在服务端环境变量，不会暴露给浏览器。
- 后面如果 AI 管线变复杂，再把 AI 层拆成 Python / FastAPI 服务。

第一版推荐架构：

```text
浏览器 Chat UI
  -> POST /api/chat
    -> lib/ai/providers/deepseek.ts
      -> DeepSeek API
    -> 保存 messages
    -> 流式返回给前端
```

## 3. 什么时候需要 Python

现在不急着上 Python。

Python 更适合放在后面这些场景：

- 文档解析很复杂
- RAG pipeline 需要频繁实验
- 要用 LangGraph / LlamaIndex / LangChain
- 要做 eval 脚本或 notebook
- 长任务、后台任务、批处理变多

也就是说：

```text
第 2 阶段：Next.js 直接接 LLM
第 3/4 阶段以后：如果 RAG 和 Agent runtime 复杂，再考虑 Python 服务
```

## 4. DeepSeek 怎么接

DeepSeek API 是 OpenAI-compatible 风格，通常可以用 fetch 直接调用。

服务端环境变量：

```text
DEEPSEEK_API_KEY=你的 key
```

后端 route 大概是：

```ts
export async function POST(req: Request) {
  const { messages } = await req.json()

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      stream: true,
    }),
  })

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  })
}
```

实际项目里不要把这段散落在 route 里，应该抽成 provider adapter。

## 5. 推荐目录结构

```text
src/
  app/
    api/
      chat/
        route.ts
  lib/
    ai/
      providers/
        types.ts
        deepseek.ts
        openai-compatible.ts
      messages.ts
      stream.ts
    db/
      schema.ts
      client.ts
```

## 6. Provider Adapter 应该长什么样

先定义统一接口：

```ts
export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type ChatProvider = {
  streamChat(input: {
    model: string
    messages: ChatMessage[]
  }): Promise<Response>
}
```

DeepSeek 实现：

```ts
export function createDeepSeekProvider(): ChatProvider {
  return {
    async streamChat({ model, messages }) {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepSeek request failed: ${response.status}`)
      }

      return response
    },
  }
}
```

以后换模型，只要换 provider，不动 UI。

## 7. 数据库要保存什么

第 2 阶段至少保存：

conversations：

- id
- title
- created_at
- updated_at

messages：

- id
- conversation_id
- role
- content
- model
- created_at

后面可扩展：

- input_tokens
- output_tokens
- latency_ms
- provider
- error

## 8. 前端怎么接流式输出

最简单的做法：

```text
用户输入
-> fetch /api/chat
-> 读取 response.body stream
-> 边读边追加到 assistant message
```

如果使用 Vercel AI SDK，可以用 `useChat`，开发会更快。

但为了你理解 Agent 底层，建议第一版可以先手写一个最小 stream reader；等流程稳定后，再引入 AI SDK 优化体验。

## 9. 第二阶段完成标准

这一阶段完成后，应该能做到：

- 可以在 Chat 页面输入消息
- 服务端调用 DeepSeek 或 OpenAI-compatible API
- AI 回复能流式显示
- 刷新页面后历史消息还在
- conversations 和 messages 有持久化
- provider adapter 已经抽象出来

## 10. 为什么这还不是 Agent

第 2 阶段完成后，它仍然主要是“聊天底座”。

它变成 Agent 要等第 3 阶段以后：

- 定义工具
- 让模型决定是否调用工具
- 执行工具
- 保存 tool_calls
- 把工具结果返回给模型

所以阶段关系是：

```text
第 2 阶段：模型能聊
第 3 阶段：模型能调用工具
第 4 阶段：模型能基于文档检索回答
第 5 阶段：Agent run 可追踪、可调试、可评估
```
