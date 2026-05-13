# 速成路线：用 AI 快速批量开发 Agent 项目

## 1. 你的目标

你的目标不是慢慢手敲一个项目，而是在短期内快速做出多个 AI Agent 项目，形成自己的项目手感和可复用模板。

所以路线要从“阶段性学习”改成“项目模板 + AI 生成 + 快速验证 + 复用改造”。

核心策略：

```text
先做一个高质量基础模板
再用这个模板快速变体出多个 Agent 项目
```

## 2. 不建议的方式

不建议按传统路线这样学：

```text
先学完后端
再学完数据库
再学完向量数据库
再学完 Agent 框架
最后才做项目
```

这样太慢，也不符合你想速成的目标。

## 3. 建议的方式

建议按这个节奏：

```text
第 1 步：让 AI 生成项目骨架
第 2 步：你负责审查架构和核心逻辑
第 3 步：让 AI 继续补页面、接口、数据库、工具
第 4 步：你跑起来验证
第 5 步：把可复用部分沉淀成模板
第 6 步：换业务场景，快速生成下一个 Agent
```

你不需要每一行都自己写，但你需要看懂：

- 数据怎么流
- 工具怎么被调用
- 状态怎么保存
- RAG 怎么检索
- 模型什么时候在决策
- 哪里可能胡说或失控

## 4. 先做一个 Agent Starter Kit

第一个项目不要只做业务功能，而要刻意沉淀一个 starter kit。

Starter Kit 应该包含：

- Next.js 应用骨架
- shadcn/ui 组件体系
- Chat 页面
- Documents 页面
- Tasks 页面
- Agent Runs 页面
- provider adapter
- tool registry
- tool executor
- agent run logger
- PostgreSQL schema
- pgvector 检索
- RAG prompt
- 基础 eval 样例

以后做新 Agent 时，只需要替换：

- 业务数据模型
- 工具列表
- prompt
- 页面局部模块
- eval case

## 5. 通用 Agent 项目结构

建议让 AI 按这个结构生成：

```text
src/
  app/
    api/
      chat/
      documents/
      tasks/
      agent-runs/
    chat/
    documents/
    tasks/
    agent-runs/
  components/
    app-shell/
    chat/
    documents/
    tasks/
    agent-runs/
    ui/
  lib/
    ai/
      providers/
      agent-runtime.ts
      prompts.ts
      tool-registry.ts
      tool-executor.ts
    db/
      schema.ts
      client.ts
    rag/
      chunking.ts
      embeddings.ts
      retrieval.ts
    evals/
```

## 6. 每个 Agent 项目的生成顺序

每次做新 Agent，可以按这个顺序让 AI 生成：

1. 产品说明和核心流程
2. 数据模型
3. 工具列表和 tool schema
4. 页面原型
5. API 设计
6. 数据库 schema
7. Agent runtime
8. UI 页面
9. eval case
10. 部署说明

这个顺序比直接说“帮我做一个 XX Agent”稳定很多。

## 7. 给 AI 的总提示词模板

```text
我要做一个 [场景名称] AI Agent。
我的技术栈是 Next.js + TypeScript + Tailwind + shadcn/ui + PostgreSQL + pgvector。
请按真实 Agent 架构设计，不要只做聊天壳。

要求：
1. 必须有工具调用。
2. 必须有状态持久化。
3. 必须保存 agent run 和 tool call 日志。
4. 如果涉及资料问答，必须使用 RAG 和引用。
5. UI 要像现代 AI 工作台，不要传统蓝白后台。
6. 先输出产品流程、数据模型、工具 schema、页面结构，再开始写代码。
```

## 8. UI 生成提示词模板

```text
请为一个 AI Agent 工作台生成 UI。
使用 Next.js、TypeScript、Tailwind、shadcn/ui、lucide-react。

视觉要求：
- 不要传统蓝白后台风格。
- 不要营销落地页。
- 要像现代 AI 产品工作台。
- 风格克制、精致、有层次。
- 可以使用深色主题、暖灰、墨色、薄荷绿、琥珀色、柔和紫色作为点缀。
- 避免大面积单一蓝色。

布局要求：
- 左侧导航
- 中间主工作区
- 右侧上下文面板
- Chat 页面要展示消息、工具调用、引用来源、输入框
- Tasks 页面要有看板或任务列表
- Documents 页面要有上传、解析状态、chunk 预览
- Agent Runs 页面要有运行日志、工具参数、工具结果、错误信息

组件要求：
- 使用 shadcn/ui 组件
- 使用 lucide-react 图标
- 所有按钮、状态、空状态、加载状态都要完整
```

## 9. 快速产出多个 Agent 的项目池

建议你用同一个 starter kit 快速做这些变体：

1. 任务与知识库 Agent
2. PDF 学习 Agent
3. 网页研究 Agent
4. 简历匹配 Agent
5. 会议纪要 Agent
6. 个人记账 Agent
7. 电商客服 Agent
8. 代码审查 Agent
9. 内容写作 Agent
10. 多 Agent 写作工作室

每个项目不要从零开始，而是复用：

- App Shell
- Chat UI
- Tool Call UI
- Agent Runs UI
- provider adapter
- tool executor
- RAG pipeline
- eval runner

## 10. 你的速成重点

你不需要把所有底层库都背熟。

你要优先掌握：

- 如何判断 AI 生成的架构是否合理
- 如何设计工具 schema
- 如何设计数据库状态
- 如何看 agent run 日志
- 如何发现 Agent 是检索错了、工具错了，还是 prompt 错了
- 如何把一个项目抽象成下一个项目可复用的模板

这会比手敲 100 个组件更有价值。
