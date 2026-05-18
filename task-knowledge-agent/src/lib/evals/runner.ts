import { taskToolDefinitions } from "@/lib/agent/tools";
import { createDeepSeekProvider } from "@/lib/ai/providers/deepseek";
import type { ChatMessage } from "@/lib/ai/providers/types";
import { getStore } from "@/lib/store";
import type { EvalCaseResult } from "@/lib/store/types";
import { evalCases, type EvalCase } from "@/lib/evals/cases";

const TOOL_EVAL_SYSTEM_PROMPT =
  "你是任务与知识库 Agent 的工具选择器。只根据用户意图决定是否调用工具。用户要求记录、安排、提醒、查看或修改任务时调用任务工具；用户问今天做什么或要求安排任务时调用 generateDailyPlan；用户询问知识库、上传资料、文档内容或要求引用来源时调用 searchDocs；普通概念解释或闲聊不要调用工具。";

export async function runEvalSuite() {
  const results: EvalCaseResult[] = [];

  for (const evalCase of evalCases) {
    results.push(await runEvalCase(evalCase));
  }

  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;

  return getStore().evalRuns.save({
    status: failed === 0 ? "passed" : "failed",
    total: results.length,
    passed,
    failed,
    results,
  });
}

async function runEvalCase(evalCase: EvalCase): Promise<EvalCaseResult> {
  if (evalCase.kind === "rag") {
    return runRagEval(evalCase);
  }

  return runToolEval(evalCase);
}

async function runToolEval(evalCase: Extract<EvalCase, { kind: "tool" }>) {
  try {
    const provider = createDeepSeekProvider();
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: TOOL_EVAL_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: evalCase.input,
      },
    ];
    const completion = await provider.createChatCompletion({
      model: "deepseek-chat",
      messages,
      tools: taskToolDefinitions,
      tool_choice: "auto",
      temperature: 0,
    });
    const actualTool =
      completion.choices[0]?.message?.tool_calls?.[0]?.function.name ?? null;
    const passed = actualTool === evalCase.expectedTool;

    return {
      id: evalCase.id,
      name: evalCase.name,
      kind: evalCase.kind,
      input: evalCase.input,
      expected: evalCase.expectedTool ?? "no_tool",
      actual: actualTool ?? "no_tool",
      passed,
      detail: passed ? undefined : "工具选择和预期不一致。",
    };
  } catch (error) {
    return {
      id: evalCase.id,
      name: evalCase.name,
      kind: evalCase.kind,
      input: evalCase.input,
      expected: evalCase.expectedTool ?? "no_tool",
      actual: "error",
      passed: false,
      detail: error instanceof Error ? error.message : "Unknown eval error.",
    };
  }
}

async function runRagEval(evalCase: Extract<EvalCase, { kind: "rag" }>) {
  try {
    const results = await getStore().documents.search({
      query: evalCase.input,
      topK: 5,
    });
    const actualCount = results.length;
    const passed =
      evalCase.minResults === 0
        ? actualCount === 0
        : actualCount >= evalCase.minResults;

    return {
      id: evalCase.id,
      name: evalCase.name,
      kind: evalCase.kind,
      input: evalCase.input,
      expected:
        evalCase.minResults === 0
          ? "0 results"
          : `>= ${evalCase.minResults} result(s)`,
      actual: `${actualCount} result(s)`,
      passed,
      detail:
        results[0] && !passed
          ? `Top result: ${results[0].documentName} · chunk ${results[0].chunkIndex}`
          : undefined,
    };
  } catch (error) {
    return {
      id: evalCase.id,
      name: evalCase.name,
      kind: evalCase.kind,
      input: evalCase.input,
      expected:
        evalCase.minResults === 0
          ? "0 results"
          : `>= ${evalCase.minResults} result(s)`,
      actual: "error",
      passed: false,
      detail: error instanceof Error ? error.message : "Unknown eval error.",
    };
  }
}
