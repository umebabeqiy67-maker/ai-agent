# Python、TypeScript 与技术栈选择

## Python 在 Agent 项目里起什么作用

Python 不是必须的，但它在 AI 工程里很常见，因为很多工具和框架最早都从 Python 生态发展起来。

Python 常见用途：

- 文档解析
- embedding 管线
- RAG 实验
- notebook 分析
- 数据清洗
- eval 脚本
- LangChain、LlamaIndex、LangGraph、CrewAI、AutoGen 等 Agent 框架
- ML 相关库

在之前那个 Python 技术栈里，Python 的角色不是前端，而是后端和 AI 编排层：

- FastAPI 接收前端请求
- Python 代码调用模型 API
- Python 代码运行工具调用循环
- Python 代码处理检索和 embedding
- 数据库保存持久状态

前端仍然可以是 React 或 Next.js。Python 不替代前端，它通常是 AI service layer。

## 为什么 Next.js 技术栈没有提 Python

Next.js 那套是 TypeScript-first 架构。它也完全可以做真正的 Agent。

在这个架构里：

- Next.js 前端负责 UI
- Next.js Route Handlers 提供后端 API
- TypeScript 调用模型 API
- TypeScript 执行工具调用
- PostgreSQL 保存状态
- pgvector / Chroma 保存向量
- Vercel 负责部署

除非你需要 Python 特有的 AI 框架或更复杂的数据处理，否则不一定要引入 Python。

## 技术栈是不是只是在模拟 Agent

不是。

浅层聊天应用通常是：

```text
用户提问
-> 应用把 prompt 发给模型
-> 模型回答
```

真正的 Agentic 应用是：

```text
用户给目标
-> 模型或 workflow 判断下一步
-> 系统调用经过校验的工具
-> 系统观察工具结果
-> 更新状态
-> 模型判断继续还是结束
-> 最终回答基于工具结果或检索上下文
```

这套能力可以用 TypeScript 做，也可以用 Python 做。

语言和框架不是关键，关键是有没有工具、状态、循环、反馈和边界。

## TypeScript-first Agent 技术栈

适合你快速做成网页产品：

- Next.js
- TypeScript
- Vercel AI SDK 或各模型 provider SDK
- PostgreSQL
- pgvector
- Zod 做工具参数校验
- Drizzle 或 Prisma
- 后期按需加后台队列

适合场景：

- 聊天 UI
- 流式输出
- 控制台
- 登录
- 用户产品
- 快速迭代

## Python-backed Agent 技术栈

适合 AI 和数据处理变重以后：

- Next.js 前端
- FastAPI AI 服务
- PostgreSQL
- pgvector 或 Chroma
- Pydantic 做 schema
- LangGraph / LlamaIndex / LangChain
- 后台 worker

适合场景：

- 复杂文档处理
- eval 管线
- RAG 实验
- Agent workflow 框架
- 数据量更大的 AI 后端任务

## 对你的建议

你更适合先从 TypeScript-first 开始，因为你熟悉前端，能更快做出一个完整产品。

等出现这些情况，再引入 Python：

- 文档解析变复杂
- 需要 notebook 或 eval
- 想使用 LangGraph / LlamaIndex
- 长时间运行的 AI 后台任务变多
- RAG 管线需要频繁实验

一个比较稳的架构是：

```text
Next.js：UI 和产品 API
PostgreSQL + pgvector：状态和向量检索
TypeScript：第一版工具调用和 Agent 流程
Python / FastAPI：当 AI 管线复杂后再拆出来
```
