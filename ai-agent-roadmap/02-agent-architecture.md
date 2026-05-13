# 什么才算真正的 AI Agent

一个项目是不是 Agent，不取决于你用了 Next.js、Python、PostgreSQL 还是向量数据库。这些只是基础设施。

更实用的定义是：

```text
LLM + 目标 + 工具 + 状态 + 决策循环 + 反馈 = Agentic System
```

## 核心组成

## 1. 模型

模型负责理解用户目标，基于上下文推理，判断是否需要调用工具，并输出下一步动作或最终回答。

## 2. 工具

工具是你暴露给模型的真实程序能力。模型不能凭空“执行”，它只能请求你的程序调用某个工具。

例如：

- searchDocs(query)
- createTask(title, dueDate)
- queryOrders(orderId)
- sendEmail(to, subject, body)
- runCode(language, source)

## 3. 状态

系统需要记录发生过什么：

- 对话消息
- 当前任务状态
- 工具调用和结果
- 用户偏好
- 检索到的文档片段
- workflow 当前步骤
- 失败次数和重试次数

没有状态，Agent 很容易退化成一次性问答。

## 4. 循环或工作流

最基础的 Agent 循环是：

```text
接收目标
-> 判断下一步
-> 需要时调用工具
-> 观察工具结果
-> 决定继续还是结束
```

真实产品里，很多时候不会让模型完全自由循环，而是使用受控 workflow：

```text
识别意图
-> 检索上下文
-> 调用指定工具
-> 生成草稿
-> 校验答案
-> 返回结果或请求人工确认
```

这样可控性、可调试性和稳定性会更好。

## 5. 防护边界

真正能用的 Agent 需要边界：

- 允许调用哪些工具
- 最大循环次数
- 参数校验
- 高风险操作需要用户确认
- 记录日志
- 限流
- 失败时的 fallback

## Chatbot 和 Agent 的区别

普通聊天机器人：

- 主要是直接回答
- 可能使用对话历史
- 不一定能操作外部系统

Agent：

- 能选择下一步行动
- 能调用工具
- 能更新外部状态
- 能完成多步骤任务
- 能观察结果并调整策略

## 关键点

Next.js、PostgreSQL、Chroma、pgvector、Vercel 这些东西本身不会自动产生 Agent。

它们分别负责：

- 页面和交互
- API
- 数据状态
- 向量检索
- 部署

真正的 Agent 逻辑在这一层：

- prompt 设计
- tool schema
- 工具执行
- 状态迁移
- 记忆策略
- RAG 上下文组装
- workflow
- eval

所以，用 TypeScript 可以做真正的 Agent，用 Python 也可以。真假不由语言决定，而由系统行为决定。
