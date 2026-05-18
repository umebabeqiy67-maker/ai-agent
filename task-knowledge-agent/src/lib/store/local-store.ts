import * as agentRunStore from "@/lib/store/agent-run-store";
import * as chatStore from "@/lib/store/chat-store";
import * as dailyPlanStore from "@/lib/store/daily-plan-store";
import * as documentStore from "@/lib/store/document-store";
import * as evalRunStore from "@/lib/store/eval-run-store";
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
  agentRuns: {
    create: agentRunStore.createAgentRun,
    complete: agentRunStore.completeAgentRun,
    list: agentRunStore.listAgentRuns,
  },
  evalRuns: {
    save: evalRunStore.saveEvalRun,
    latest: evalRunStore.getLatestEvalRun,
    list: evalRunStore.listEvalRuns,
  },
  documents: {
    create: documentStore.createDocument,
    list: documentStore.listDocuments,
    search: documentStore.searchDocuments,
    delete: documentStore.deleteDocument,
  },
  dailyPlans: {
    generate: dailyPlanStore.generateDailyPlan,
    latest: dailyPlanStore.getLatestDailyPlan,
  },
};
