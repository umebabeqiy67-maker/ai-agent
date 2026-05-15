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
  name: string;
  arguments: unknown;
  result?: unknown;
  status: "success" | "error";
  error?: string;
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
};
