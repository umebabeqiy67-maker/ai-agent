import type { ChatProvider } from "@/lib/ai/providers/types";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export function createDeepSeekProvider(): ChatProvider {
  return {
    async streamChat({ model, messages, temperature = 0.7 }) {
      const apiKey = process.env.DEEPSEEK_API_KEY;

      if (!apiKey) {
        throw new Error("DEEPSEEK_API_KEY is not configured.");
      }

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`DeepSeek request failed: ${response.status} ${detail}`);
      }

      return response;
    },
    async createChatCompletion({ model, messages, temperature = 0.7, tools, tool_choice }) {
      const apiKey = process.env.DEEPSEEK_API_KEY;

      if (!apiKey) {
        throw new Error("DEEPSEEK_API_KEY is not configured.");
      }

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          tools,
          tool_choice,
          stream: false,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`DeepSeek request failed: ${response.status} ${detail}`);
      }

      return response.json();
    },
  };
}
