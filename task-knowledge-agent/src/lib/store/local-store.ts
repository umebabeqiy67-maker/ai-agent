import * as chatStore from "@/lib/store/chat-store";
import * as documentStore from "@/lib/store/document-store";
import * as taskStore from "@/lib/store/task-store";
import * as toolCallStore from "@/lib/store/tool-call-store";
import type { AppStore } from "@/lib/store/types";

export const localStore: AppStore = {
  chat: {
    getCurrentConversation: chatStore.getCurrentConversation,
    appendMessage: chatStore.appendMessage,
  },
  tasks: {
    create: taskStore.createTask,
    list: taskStore.listTasks,
    update: taskStore.updateTask,
  },
  toolCalls: {
    save: toolCallStore.saveToolCall,
    list: toolCallStore.listToolCalls,
  },
  documents: {
    create: documentStore.createDocument,
    list: documentStore.listDocuments,
    search: documentStore.searchDocuments,
  },
};
