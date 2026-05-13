# AI Agent Workspace

这个仓库包含两部分：

- `ai-agent-roadmap/`：AI Agent 学习路线、项目计划、UI 建议和阶段说明文档。
- `task-knowledge-agent/`：任务与知识库 Agent Starter Kit，使用 Next.js、TypeScript、Tailwind CSS、shadcn/ui 和 lucide-react。

## 当前进度

已完成：

- 第 1 阶段：项目骨架、统一 App Shell、Chat / Documents / Tasks / Agent Runs / Settings 页面。
- 第 2 阶段：基础聊天、`/api/chat`、DeepSeek provider adapter、mock streaming、messages/conversations 本地持久化。

## 本地运行

```bash
cd task-knowledge-agent
npm install
npm run dev -- --port 3026
```

访问：

```text
http://localhost:3026
```

## LLM 配置

复制环境变量示例：

```bash
cp .env.example .env.local
```

设置：

```text
DEEPSEEK_API_KEY=你的 key
```

没有配置 API Key 时，项目会使用本地 mock provider，方便验证流式聊天和消息持久化。
