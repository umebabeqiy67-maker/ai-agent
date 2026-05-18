export type ToolEvalCase = {
  id: string;
  name: string;
  kind: "tool";
  input: string;
  expectedTool: string | null;
};

export type RagEvalCase = {
  id: string;
  name: string;
  kind: "rag";
  input: string;
  minResults: number;
};

export type EvalCase = ToolEvalCase | RagEvalCase;

export const evalCases: EvalCase[] = [
  {
    id: "tool-create-reminder",
    name: "创建提醒任务",
    kind: "tool",
    input: "明天下午提醒我整理 AI Agent 学习计划，优先级高",
    expectedTool: "createTask",
  },
  {
    id: "tool-create-reading",
    name: "创建阅读任务",
    kind: "tool",
    input: "帮我加一个任务：今晚读完 RAG 文档，优先级中等",
    expectedTool: "createTask",
  },
  {
    id: "tool-list-open",
    name: "查询未完成任务",
    kind: "tool",
    input: "我现在还有哪些没完成的任务？",
    expectedTool: "listTasks",
  },
  {
    id: "tool-list-today",
    name: "查询今日任务",
    kind: "tool",
    input: "今天有哪些待办？",
    expectedTool: "listTasks",
  },
  {
    id: "tool-update-done",
    name: "更新任务状态",
    kind: "tool",
    input: "把 id 为 11111111-1111-1111-1111-111111111111 的任务标记为完成",
    expectedTool: "updateTask",
  },
  {
    id: "tool-update-priority",
    name: "更新任务优先级",
    kind: "tool",
    input: "把任务 22222222-2222-2222-2222-222222222222 的优先级改成高",
    expectedTool: "updateTask",
  },
  {
    id: "tool-daily-plan",
    name: "生成今日计划",
    kind: "tool",
    input: "今天我该做什么？帮我安排一下",
    expectedTool: "generateDailyPlan",
  },
  {
    id: "tool-daily-schedule",
    name: "安排日程",
    kind: "tool",
    input: "根据我的任务生成一个今天的执行顺序",
    expectedTool: "generateDailyPlan",
  },
  {
    id: "tool-search-docs",
    name: "搜索知识库",
    kind: "tool",
    input: "知识库里关于 MVP 范围是怎么说的？",
    expectedTool: "searchDocs",
  },
  {
    id: "tool-search-uploaded",
    name: "查询上传资料",
    kind: "tool",
    input: "根据我上传的资料，总结一下 RAG 的流程",
    expectedTool: "searchDocs",
  },
  {
    id: "tool-no-general",
    name: "普通闲聊不调用工具",
    kind: "tool",
    input: "你觉得学习 AI Agent 最容易踩的坑是什么？",
    expectedTool: null,
  },
  {
    id: "tool-no-explain",
    name: "概念解释不调用工具",
    kind: "tool",
    input: "简单解释一下 tool calling 是什么",
    expectedTool: null,
  },
  {
    id: "tool-create-plan-task",
    name: "计划落任务",
    kind: "tool",
    input: "把学习 Supabase 向量库这件事加入任务，明天做",
    expectedTool: "createTask",
  },
  {
    id: "tool-search-citation",
    name: "要求引用资料",
    kind: "tool",
    input: "从知识库找一下 UI skill 的建议，并带来源回答",
    expectedTool: "searchDocs",
  },
  {
    id: "rag-mvp",
    name: "RAG 命中 MVP 文档",
    kind: "rag",
    input: "MVP 范围和工具列表",
    minResults: 1,
  },
  {
    id: "rag-ui-skill",
    name: "RAG 命中 UI skill",
    kind: "rag",
    input: "UI skills 与视觉方向",
    minResults: 1,
  },
  {
    id: "rag-production",
    name: "RAG 命中生产计划",
    kind: "rag",
    input: "Starter Kit 复用策略",
    minResults: 1,
  },
  {
    id: "rag-agent-runs",
    name: "RAG 命中 Agent Runs",
    kind: "rag",
    input: "Agent Runs 页面 工具参数 结果 错误",
    minResults: 1,
  },
  {
    id: "rag-rag-flow",
    name: "RAG 命中流程说明",
    kind: "rag",
    input: "文档切块 embedding 向量库 检索 top-k",
    minResults: 1,
  },
  {
    id: "rag-no-random",
    name: "无关查询不乱命中",
    kind: "rag",
    input: "火星基地咖啡豆采购合同",
    minResults: 0,
  },
];
