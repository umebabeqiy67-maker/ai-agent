export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type StoredConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredMessage = {
  id: string;
  conversationId: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  model?: string;
  createdAt: string;
};

export type StoredTask = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  source: "agent" | "manual";
  sourceMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredToolCall = {
  id: string;
  runId?: string;
  name: string;
  arguments: unknown;
  result?: unknown;
  status: "success" | "error";
  error?: string;
  durationMs?: number;
  createdAt: string;
};

export type StoredAgentRun = {
  id: string;
  conversationId: string;
  input: string;
  model: string;
  status: "running" | "success" | "error";
  output?: string;
  error?: string;
  durationMs?: number;
  createdAt: string;
  completedAt?: string;
};

export type StoredAgentRunWithToolCalls = StoredAgentRun & {
  toolCalls: StoredToolCall[];
};

export type EvalCaseResult = {
  id: string;
  name: string;
  kind: "tool" | "rag";
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  detail?: string;
};

export type StoredEvalRun = {
  id: string;
  status: "passed" | "failed";
  total: number;
  passed: number;
  failed: number;
  results: EvalCaseResult[];
  createdAt: string;
};

export type StoredDocument = {
  id: string;
  name: string;
  type: string;
  status: "indexed";
  chunkCount: number;
  createdAt: string;
};

export type StoredChunk = {
  id: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  tokens: string[];
  createdAt: string;
};

export type SearchResult = StoredChunk & {
  score: number;
};

export type DailyPlanItem = {
  taskId: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  slot: string;
  rationale: string;
};

export type StoredDailyPlan = {
  id: string;
  date: string;
  title: string;
  summary: string;
  items: DailyPlanItem[];
  createdAt: string;
};

export type AppStore = {
  chat: {
    getCurrentConversation(): Promise<{
      conversation: StoredConversation;
      messages: StoredMessage[];
    }>;
    appendMessage(input: {
      conversationId?: string;
      role: StoredMessage["role"];
      content: string;
      model?: string;
    }): Promise<StoredMessage>;
  };
  tasks: {
    create(input: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: string;
      sourceMessage?: string;
    }): Promise<StoredTask>;
    list(filter?: { status?: TaskStatus }): Promise<StoredTask[]>;
    update(input: {
      id: string;
      status?: TaskStatus;
      title?: string;
      priority?: TaskPriority;
    }): Promise<StoredTask>;
  };
  toolCalls: {
    save(input: Omit<StoredToolCall, "id" | "createdAt">): Promise<StoredToolCall>;
    list(): Promise<StoredToolCall[]>;
  };
  agentRuns: {
    create(input: {
      conversationId: string;
      input: string;
      model: string;
    }): Promise<StoredAgentRun>;
    complete(input: {
      id: string;
      status: "success" | "error";
      output?: string;
      error?: string;
      durationMs: number;
    }): Promise<StoredAgentRun>;
    list(): Promise<StoredAgentRunWithToolCalls[]>;
  };
  evalRuns: {
    save(input: Omit<StoredEvalRun, "id" | "createdAt">): Promise<StoredEvalRun>;
    latest(): Promise<StoredEvalRun | null>;
    list(): Promise<StoredEvalRun[]>;
  };
  documents: {
    create(input: {
      name: string;
      type?: string;
      content: string;
    }): Promise<{ document: StoredDocument; chunks: StoredChunk[] }>;
    list(): Promise<StoredDocument[]>;
    search(input: { query: string; topK?: number }): Promise<SearchResult[]>;
    delete(id: string): Promise<StoredDocument>;
  };
  dailyPlans: {
    generate(input?: { date?: string }): Promise<StoredDailyPlan>;
    latest(): Promise<StoredDailyPlan | null>;
  };
};
