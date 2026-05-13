# 建议第一个项目：TypeScript-first 任务与知识库 Agent

这是比较适合你当前背景的第一个正式 Agent 项目。

## 产品形态

做一个个人工作区 Agent，结合任务管理和知识库：

- 和 Agent 聊天
- 上传笔记或文档
- 基于资料问答
- 从对话里创建任务
- 生成每日计划
- 追踪进度

## 为什么选这个项目

它不会太玩具化，也不会一上来就复杂到失控。

它覆盖：

- 前端 UI
- 后端 API
- 数据库状态
- RAG
- 工具调用
- 流式输出
- 状态化 workflow
- eval 雏形

## MVP 范围

页面：

- Chat
- Documents
- Tasks
- Agent Run Logs

工具：

- searchDocs(query)
- createTask(title, priority, dueDate)
- listTasks(status)
- updateTask(id, status)
- generateDailyPlan(date)

Agent 行为：

- 用户问上传资料相关问题时，先调用 searchDocs。
- 用户说要记住、安排、待办时，调用 createTask。
- 用户问今天做什么时，先查询 tasks，再生成计划。
- 置信度低时，先问澄清问题。

## 里程碑计划

第 1 周：

- Next.js 应用壳
- 聊天 UI
- 流式输出
- provider adapter
- messages 表

第 2 周：

- task 数据库
- create/list/update task 工具
- 工具调用日志

第 3 周：

- 文档上传
- 文档解析
- chunk 存储
- embedding
- 检索

第 4 周：

- RAG 引用回答
- 每日计划工具
- agent run log UI

第 5 周：

- eval case
- 错误处理
- 限流
- 部署

## 成功标准

项目做到下面这些，就算第一阶段成功：

- 能基于上传文档回答，并给出引用
- 能通过工具调用创建和更新任务
- 能基于真实任务生成每日计划
- 能展示调用了哪些工具、为什么调用
- 常见失败不会静默胡说，而是有可见错误或澄清逻辑
