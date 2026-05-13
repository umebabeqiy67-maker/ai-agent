export type ChatRole = "system" | "user" | "assistant" | "tool";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

export type StreamChatInput = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
};

export type ChatProvider = {
  streamChat(input: StreamChatInput): Promise<Response>;
  createChatCompletion(input: ChatCompletionInput): Promise<ChatCompletion>;
};

export type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type ChatCompletionInput = StreamChatInput & {
  tools?: ToolDefinition[];
  tool_choice?: "auto" | "none" | "required";
};

export type ChatCompletion = {
  choices: Array<{
    message: ChatMessage;
    finish_reason?: string;
  }>;
};
