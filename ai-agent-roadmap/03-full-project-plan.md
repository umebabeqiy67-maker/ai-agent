# 完整项目计划：AI 学习教练 Agent

## 产品目标

做一个 AI 学习教练。用户可以上传课程资料、笔记或 PDF，Agent 能基于资料问答、总结、生成复习计划、出题测验、追踪学习进度，并根据反馈调整后续计划。

这个项目适合作为完整 Agent 项目，因为它覆盖了：

- 聊天 UI
- LLM 流式输出
- RAG
- 工具调用
- 数据库状态
- 计划生成
- 记忆机制
- 评估
- 部署

## 推荐技术栈

前端：

- Next.js
- React
- TypeScript
- Tailwind CSS

后端：

- 简单版本用 Next.js Route Handlers
- 如果 AI 管线变复杂，再拆 FastAPI 服务

数据库：

- PostgreSQL
- pgvector，用一个数据库同时保存业务数据和向量

AI 层：

- OpenAI-compatible API client
- DeepSeek / OpenAI / Gemini 等 provider adapter
- embedding provider
- 可选 LangGraph、LangChain、LlamaIndex，但建议先理解原始流程再引入框架

后台任务：

- 早期可以先在 API route 中处理
- 后期再加队列，用于解析文档、生成 embedding、生成报告、跑长任务

部署：

- Next.js 部署到 Vercel
- PostgreSQL 使用托管服务
- 如果引入 Python 服务，可部署到 Railway、Fly.io、Render 等

## 数据模型

建议表：

- users
- documents
- document_chunks
- conversations
- messages
- tool_calls
- study_goals
- study_plan_items
- quiz_questions
- user_progress
- agent_runs

## Agent 工具设计

searchKnowledgeBase(query, filters)

从用户上传的资料里检索相关 chunk。

summarizeDocument(documentId)

为指定文档生成结构化总结。

generateQuiz(topic, difficulty, count)

根据资料生成测验题。

createStudyPlan(goal, days, availableMinutesPerDay)

根据目标和可用时间生成学习计划。

updateProgress(planItemId, status, notes)

记录用户完成情况。

revisePlan(goalId, feedback)

根据用户反馈调整学习计划。

## 里程碑 1：Provider Adapter 与聊天

要做：

- 创建模型调用抽象层
- 支持流式聊天
- 保存消息到数据库
- 记录延迟、token 和成本估算

完成标准：

用户可以和模型聊天，并能查看历史记录。

## 里程碑 2：文档上传与解析

要做：

- 上传 PDF / Markdown / TXT
- 解析文本
- 切分 chunk
- 保存 documents 和 document_chunks

完成标准：

上传的文档可以被全文搜索。

## 里程碑 3：Embedding 与检索

要做：

- 生成 embedding
- 保存向量
- 检索 top-k chunk
- 把检索结果组装进回答上下文
- 返回引用来源

完成标准：

Agent 能基于用户自己的资料回答，并附带引用。

## 里程碑 4：工具调用

要做：

- 定义工具 schema
- 让模型调用 searchKnowledgeBase 和 generateQuiz
- 校验参数
- 保存工具调用和结果

完成标准：

模型可以判断什么时候应该先搜索资料再回答。

## 里程碑 5：学习计划工作流

要做：

- 创建学习目标表单
- 生成学习计划
- 保存每日任务
- 支持完成状态更新
- 根据反馈修订计划

完成标准：

用户可以跟随计划学习，并让 Agent 根据进度调整。

## 里程碑 6：Agent Run Tracing

要做：

- 保存每次 agent run
- 保存每一步 tool call
- 做一个调试视图
- 加最大步数限制和错误状态

完成标准：

你能回看 Agent 为什么这么回答、调用了什么工具、在哪一步失败。

## 里程碑 7：评估

要做：

- 为样例文档准备测试问题
- 检查回答是否包含引用
- 检查回答是否基于检索 chunk
- 测试工具调用是否正确

完成标准：

改 prompt 或改检索策略后，可以对比效果，而不是全靠感觉。

## 里程碑 8：部署与打磨

要做：

- 登录
- 限流
- 用量上限
- 错误 UI
- 空状态
- README
- demo 数据

完成标准：

别人可以打开部署地址直接试用，不需要你在旁边解释。
