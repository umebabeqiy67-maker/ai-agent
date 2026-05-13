# AI Agent 学习资料包

适合对象：熟悉前端，也能写后端和数据库；之前学过一点 Python；平时会看 AI 相关内容；不是零基础小白。

这套资料不是“从变量和接口开始”的入门路线，而是面向真正做 AI Agent 项目需要掌握的工程能力：

- 大模型 API 调用
- 流式输出
- 工具调用
- RAG
- 状态管理
- 记忆机制
- 工作流编排
- 评估与调试
- 部署和成本控制

## 语言怎么选

AI Agent 没有严格语言限制。只要一门语言能调用 HTTP API、维护状态、执行工具函数、读写数据库，就能做 Agent。

但目前最顺手的组合通常是：

- TypeScript / Next.js：适合做产品界面、聊天 UI、API 路由、流式响应、登录、后台面板和部署。
- Python：适合做 AI 后端、RAG 管线、文档处理、实验脚本、评估、数据清洗，以及使用 LangChain、LlamaIndex、LangGraph、CrewAI、AutoGen 这类框架。
- SQL / PostgreSQL：适合保存任务状态、聊天记录、用户数据、工具调用日志、长期记忆和向量检索数据。

对你更合适的路线是：

先用 TypeScript-first 的方式做出完整产品，再在 AI 管线变复杂时引入 Python 服务。

也就是：

```text
Next.js 做产品主体
PostgreSQL / pgvector 保存状态和向量
TypeScript 先实现工具调用和 Agent 流程
必要时再拆 Python / FastAPI 做 AI 服务层
```
