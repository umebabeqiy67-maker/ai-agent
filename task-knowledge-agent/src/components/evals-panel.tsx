"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Loader2,
  RefreshCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type EvalCase = {
  id: string;
  name: string;
  kind: "tool" | "rag";
  input: string;
  expectedTool?: string | null;
  minResults?: number;
};

type EvalCaseResult = {
  id: string;
  name: string;
  kind: "tool" | "rag";
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  detail?: string;
};

type EvalRun = {
  id: string;
  status: "passed" | "failed";
  total: number;
  passed: number;
  failed: number;
  results: EvalCaseResult[];
  createdAt: string;
};

export function EvalsPanel() {
  const [cases, setCases] = useState<EvalCase[]>([]);
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [latest, setLatest] = useState<EvalRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadEvals() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/evals", { cache: "no-store" });

      if (!response.ok) {
        setNotice("加载 eval 数据失败。");
        return;
      }

      const data = (await response.json()) as {
        cases: EvalCase[];
        latest: EvalRun | null;
        runs: EvalRun[];
      };
      setCases(data.cases);
      setLatest(data.latest);
      setRuns(data.runs);
    } finally {
      setIsLoading(false);
    }
  }

  async function runEvals() {
    setIsRunning(true);
    setNotice("");

    try {
      const response = await fetch("/api/evals", {
        method: "POST",
      });

      if (!response.ok) {
        setNotice("执行 eval 失败。检查 DEEPSEEK_API_KEY 或 Vercel Function 日志。");
        return;
      }

      const data = (await response.json()) as { run: EvalRun };
      setLatest(data.run);
      setRuns((current) => [data.run, ...current]);
      setNotice(
        data.run.failed === 0
          ? "Eval 全部通过。"
          : `Eval 完成，有 ${data.run.failed} 个失败案例。`,
      );
    } finally {
      setIsRunning(false);
    }
  }

  useEffect(() => {
    loadEvals();
  }, []);

  const passRate = useMemo(() => {
    if (!latest || latest.total === 0) {
      return 0;
    }

    return Math.round((latest.passed / latest.total) * 100);
  }, [latest]);

  return (
    <div className="grid min-h-0 gap-5 overflow-auto p-6">
      <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FlaskConical className="h-4 w-4 text-[#7dd3c7]" />
              Eval Runner
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a8adba]">
              固定 20 个样例：工具选择 eval 只测试 DeepSeek 是否选择正确工具，不真正执行工具；RAG eval 直接测试当前知识库检索命中。
            </p>
            {notice ? (
              <div className="mt-3 rounded-[14px] border border-white/10 bg-white/[.045] px-3 py-2 text-sm text-[#a8adba]">
                {notice}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={runEvals}
                disabled={isRunning}
                className="rounded-[14px] bg-gradient-to-br from-[#7dd3c7] to-[#d9f99d] font-bold text-[#111318] hover:brightness-105"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FlaskConical className="h-4 w-4" />
                )}
                {isRunning ? "运行中" : "运行 20 个 eval"}
              </Button>
              <Button
                onClick={loadEvals}
                disabled={isLoading}
                variant="outline"
                className="rounded-[14px] border-white/10 bg-white/[.045] text-[#f3f0e8] hover:bg-white/[.075]"
              >
                <RefreshCcw className="h-4 w-4" />
                刷新
              </Button>
            </div>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-[#111319]/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">最近通过率</span>
              <Badge
                variant="outline"
                className="rounded-full border-white/10 text-[#a8adba]"
              >
                {latest?.status ?? "no run"}
              </Badge>
            </div>
            <div className="mt-4 text-3xl font-semibold">{passRate}%</div>
            <Progress value={passRate} className="mt-4" />
            <div className="mt-3 text-xs text-[#a8adba]">
              {latest
                ? `${latest.passed}/${latest.total} passed · ${new Date(latest.createdAt).toLocaleString()}`
                : "还没有运行过 eval。"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
          <CardHeader>
            <CardTitle className="text-sm">最近结果</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {latest ? (
              latest.results.map((result) => (
                <ResultRow key={result.id} result={result} />
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/10 p-5 text-sm text-[#777f90]">
                点击“运行 20 个 eval”后，这里会记录每个案例的预期、实际结果和失败原因。
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid content-start gap-5">
          <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
            <CardHeader>
              <CardTitle className="text-sm">Case Set</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {cases.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[14px] border border-white/10 bg-white/[.045] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{item.name}</div>
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/10 text-[#a8adba]"
                    >
                      {item.kind}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs leading-5 text-[#a8adba]">
                    {item.input}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
            <CardHeader>
              <CardTitle className="text-sm">历史运行</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {runs.length > 0 ? (
                runs.slice(0, 8).map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-white/[.045] px-3 py-2 text-xs"
                  >
                    <span className="text-[#a8adba]">
                      {new Date(run.createdAt).toLocaleString()}
                    </span>
                    <span className="font-semibold">
                      {run.passed}/{run.total}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-[16px] border border-dashed border-white/10 p-4 text-sm text-[#777f90]">
                  暂无历史。
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ result }: Readonly<{ result: EvalCaseResult }>) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-[#111319]/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {result.passed ? (
              <CheckCircle2 className="h-4 w-4 text-[#a3e635]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-[#f6c76f]" />
            )}
            {result.name}
          </div>
          <div className="mt-1 text-xs text-[#777f90]">{result.input}</div>
        </div>
        <Badge
          variant="outline"
          className="rounded-full border-white/10 text-[#a8adba]"
        >
          {result.kind}
        </Badge>
      </div>
      <div className="mt-3 grid gap-2 text-xs leading-5 text-[#a8adba] md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[.035] p-2">
          预期：{result.expected}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.035] p-2">
          实际：{result.actual}
        </div>
      </div>
      {result.detail ? (
        <div className="mt-2 rounded-xl border border-white/10 bg-white/[.035] p-2 text-xs text-[#a8adba]">
          {result.detail}
        </div>
      ) : null}
    </div>
  );
}
