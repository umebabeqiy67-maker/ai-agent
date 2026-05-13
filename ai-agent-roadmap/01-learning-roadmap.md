# 学习路线

## 阶段 1：LLM API 与流式输出

目标：不是只做一个 demo，而是做一个有产品形态的聊天接口。

需要掌握：

- chat / responses API
- system、user、assistant、tool message
- 流式输出
- JSON 结构化输出
- token 用量统计
- 成本估算
- 模型切换
- 环境变量和服务端 API Key 管理

练手项目：

- Next.js 聊天页面
- 支持流式输出
- 支持 DeepSeek / OpenAI-compatible provider 切换
- 保存消息、模型、token、延迟、成本估算

## 阶段 2：工具调用

目标：让模型不只是回答，而是能请求你的程序执行动作。

需要掌握：

- tool schema
- 参数校验，TypeScript 里可用 Zod，Python 里可用 Pydantic
- tool result 如何回传给模型
- 多轮工具调用
- 最大执行步数
- 权限边界

练手项目：

- 任务管理 Agent
- 工具包括 createTask、updateTask、listTasks、summarizeTasks
- 所有工具调用写入数据库日志

## 阶段 3：RAG

目标：让 Agent 能基于你的资料回答，而不是只靠模型自己的训练知识。

需要掌握：

- 文档解析
- chunk 切分策略
- embedding
- 向量检索
- 混合检索
- 引用来源
- rerank
- 上下文组装

练手项目：

- PDF / Markdown 知识库助手
- 上传、解析、切块、embedding、检索、回答并附引用
- 对比普通切块和按章节切块的效果差异

## 阶段 4：Agent 循环与工作流

目标：理解普通聊天机器人和 Agentic Workflow 的区别。

需要掌握：

- plan -> act -> observe -> decide
- ReAct 思路
- 确定性 workflow 节点
- 人工确认节点
- 重试和失败状态
- 后台任务

练手项目：

- 研究报告 Agent
- 能搜索、提取、保存笔记、生成草稿
- 在最终输出前请求用户确认

## 阶段 5：记忆与状态

目标：分清聊天历史、产品状态、长期记忆和检索上下文。

需要掌握：

- 对话历史
- 历史摘要
- 用户偏好
- 实体记忆
- 向量记忆
- 状态机
- 任务持久化

练手项目：

- 学习教练 Agent
- 记住学习目标
- 追踪学习进度
- 根据反馈调整后续计划

## 阶段 6：评估与可靠性

目标：不要只靠感觉判断 Agent 好不好。

需要掌握：

- golden test set
- 工具调用准确率测试
- 检索质量测试
- 回答是否基于资料
- 回归评估
- tracing 和 observability

练手项目：

- 给 RAG 和工具调用流程写 eval 脚本
- 统计延迟、失败工具调用、检索失败、成本

## 阶段 7：多 Agent 系统

目标：只在多 Agent 能降低复杂度时使用它。

需要掌握：

- planner / executor / reviewer
- 角色化 prompt
- 消息交接
- 共享状态
- 冲突处理
- 什么时候不该用多 Agent

练手项目：

- 写作工作室
- researcher、outliner、writer、critic、editor
- 用明确 workflow 控制协作，而不是让多个 Agent 无限聊天

## 阶段 8：部署与产品化

目标：上线一个别人真的能用的项目。

需要掌握：

- 登录
- 数据库迁移
- 队列任务
- 限流
- 后台任务
- 部署环境变量
- 日志和 tracing
- 成本上限

最终成果：

- 一个可访问的网址
- 一个 GitHub 仓库
- 一份 README
- 一组 demo 数据
- 一段简短演示视频
