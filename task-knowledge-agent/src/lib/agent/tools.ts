import { z } from "zod";

import {
  createTask,
  listTasks,
  updateTask,
} from "@/lib/store/task-store";
import { saveToolCall } from "@/lib/store/tool-call-store";
import type { ToolDefinition } from "@/lib/ai/providers/types";

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
  sourceMessage: z.string().optional(),
});

const listTasksSchema = z.object({
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

const updateTaskSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  title: z.string().min(1).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export const taskToolDefinitions: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "createTask",
      description:
        "Create a real task when the user asks to remember, schedule, plan, add, create, or be reminded about work.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A concise task title in the user's language.",
          },
          description: {
            type: "string",
            description: "Optional detailed task description.",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Task priority.",
          },
          dueDate: {
            type: "string",
            description: "Optional due date in YYYY-MM-DD format.",
          },
          sourceMessage: {
            type: "string",
            description: "The original user request that caused this task.",
          },
        },
        required: ["title", "description", "priority", "sourceMessage"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listTasks",
      description:
        "List existing tasks when the user asks what tasks, reminders, plans, todos, or unfinished work they have.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
            description: "Optional task status filter.",
          },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateTask",
      description:
        "Update a task title, priority, or status when the user explicitly asks to modify an existing task.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Task id to update.",
          },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
            description: "New task status.",
          },
          title: {
            type: "string",
            description: "New task title.",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "New task priority.",
          },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
];

export async function executeTool(name: string, rawArguments: unknown) {
  try {
    const result = await runTool(name, rawArguments);
    await saveToolCall({
      name,
      arguments: rawArguments,
      result,
      status: "success",
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown tool error";
    await saveToolCall({
      name,
      arguments: rawArguments,
      status: "error",
      error: message,
    });

    throw error;
  }
}

export function parseToolArguments(argumentsText: string) {
  try {
    return JSON.parse(argumentsText) as unknown;
  } catch {
    throw new Error(`Invalid tool arguments JSON: ${argumentsText}`);
  }
}

async function runTool(name: string, rawArguments: unknown) {
  if (name === "createTask") {
    return createTask(createTaskSchema.parse(rawArguments));
  }

  if (name === "listTasks") {
    return listTasks(listTasksSchema.parse(rawArguments));
  }

  if (name === "updateTask") {
    return updateTask(updateTaskSchema.parse(rawArguments));
  }

  throw new Error(`Unknown tool: ${name}`);
}
