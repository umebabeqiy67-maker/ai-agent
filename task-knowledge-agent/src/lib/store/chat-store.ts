import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ChatRole } from "@/lib/ai/providers/types";

export type StoredMessage = {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  model?: string;
  createdAt: string;
};

export type StoredConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type ChatStoreData = {
  conversations: StoredConversation[];
  messages: StoredMessage[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "chat-store.json");
const DEFAULT_CONVERSATION_ID = "default";

export async function getCurrentConversation() {
  const store = await readStore();
  const conversation = ensureDefaultConversation(store);
  await writeStore(store);

  return {
    conversation,
    messages: store.messages.filter(
      (message) => message.conversationId === conversation.id,
    ),
  };
}

export async function appendMessage(input: {
  conversationId?: string;
  role: ChatRole;
  content: string;
  model?: string;
}) {
  const store = await readStore();
  const conversation = ensureDefaultConversation(store);
  const now = new Date().toISOString();

  const message: StoredMessage = {
    id: crypto.randomUUID(),
    conversationId: input.conversationId ?? conversation.id,
    role: input.role,
    content: input.content,
    model: input.model,
    createdAt: now,
  };

  store.messages.push(message);
  conversation.updatedAt = now;

  if (input.role === "user" && conversation.title === "New conversation") {
    conversation.title = input.content.slice(0, 32);
  }

  await writeStore(store);
  return message;
}

async function readStore(): Promise<ChatStoreData> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as ChatStoreData;
  } catch {
    return {
      conversations: [],
      messages: [],
    };
  }
}

async function writeStore(store: ChatStoreData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function ensureDefaultConversation(store: ChatStoreData) {
  let conversation = store.conversations.find(
    (item) => item.id === DEFAULT_CONVERSATION_ID,
  );

  if (!conversation) {
    const now = new Date().toISOString();

    conversation = {
      id: DEFAULT_CONVERSATION_ID,
      title: "New conversation",
      createdAt: now,
      updatedAt: now,
    };

    store.conversations.push(conversation);
  }

  return conversation;
}
