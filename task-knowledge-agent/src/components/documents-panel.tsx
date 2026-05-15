"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileText, Search, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  status: "indexed";
  chunkCount: number;
  createdAt: string;
};

type SearchResult = {
  id: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  score: number;
};

export function DocumentsPanel() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [name, setName] = useState("AI Agent note");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notice, setNotice] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function loadDocuments() {
    const response = await fetch("/api/documents", { cache: "no-store" });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { documents: DocumentItem[] };
    setDocuments(data.documents);
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    setIsUploading(true);
    setNotice("");

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("content", content);
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        setNotice(errorBody.error ?? "保存失败。");
        return;
      }

      setContent("");
      await loadDocuments();
      setNotice("已保存并切分入库。");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setNotice("");

    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        setNotice(errorBody.error ?? "文件上传失败。");
        return;
      }

      await loadDocuments();
      setNotice("文件已保存并切分入库。");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSearch() {
    if (!query.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setNotice("");

    try {
      const response = await fetch("/api/documents/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, topK: 5 }),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        setNotice(errorBody.error ?? "检索失败。");
        setResults([]);
        return;
      }

      const data = (await response.json()) as { results: SearchResult[] };
      setResults(data.results);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="grid min-h-0 gap-5 overflow-auto p-6">
      <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
        <CardContent className="grid gap-5 p-5 xl:grid-cols-[1fr_1fr]">
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div>
              <h2 className="text-base font-semibold">上传/粘贴资料</h2>
              <p className="mt-1 text-sm text-[#a8adba]">
                支持 .txt、.md、.csv、.json 等文本文件。PDF 需要解析器，当前不会作为有效知识库入库。
              </p>
            </div>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl border-white/10 bg-white/[.045] text-[#f3f0e8]"
              placeholder="文档名称"
            />
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-36 rounded-xl border-white/10 bg-white/[.045] text-[#f3f0e8]"
              placeholder="粘贴一段项目资料、学习笔记或 Markdown..."
            />
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={isUploading}
                className="rounded-[14px] bg-gradient-to-br from-[#7dd3c7] to-[#d9f99d] font-bold text-[#111318] hover:brightness-105"
              >
                <UploadCloud className="h-4 w-4" />
                保存到知识库
              </Button>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[14px] border border-white/10 bg-white/[.045] px-4 text-sm text-[#f3f0e8] hover:bg-white/[.075]">
                <UploadCloud className="h-4 w-4" />
                选择文件
                <input
                  type="file"
                  accept=".txt,.md,.markdown,.json,.csv,.log,.html,.css,.js,.jsx,.ts,.tsx,.xml,.yaml,.yml"
                  className="hidden"
                  onChange={(event) => handleFileUpload(event.target.files?.[0])}
                />
              </label>
            </div>
          </form>

          <div className="grid content-start gap-3">
            <div>
              <h2 className="text-base font-semibold">检索测试</h2>
              <p className="mt-1 text-sm text-[#a8adba]">
                这里直接调用 `/api/documents/search`，Chat 里则由 LLM 调用 `searchDocs`。
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777f90]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="rounded-xl border-white/10 bg-white/[.045] pl-9 text-[#f3f0e8] placeholder:text-[#777f90]"
                  placeholder="搜索知识库"
                />
              </div>
            <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                variant="outline"
                className="rounded-[14px] border-white/10 bg-white/[.045] text-[#f3f0e8] hover:bg-white/[.075]"
              >
                {isSearching ? "搜索中" : "搜索"}
              </Button>
            </div>
            {notice ? (
              <div className="rounded-[14px] border border-white/10 bg-white/[.045] px-3 py-2 text-sm text-[#a8adba]">
                {notice}
              </div>
            ) : null}
            <div className="grid gap-3">
              {results.length > 0 ? (
                results.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-[16px] border border-white/10 bg-[#111319]/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-[#a8adba]">
                      <span>{result.documentName}</span>
                      <span>
                        chunk {result.chunkIndex} · score {result.score}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-[#f3f0e8]">
                      {result.content}
                    </p>
                  </div>
                ))
              ) : hasSearched ? (
                <div className="rounded-[16px] border border-dashed border-white/10 p-5 text-sm text-[#777f90]">
                  没有匹配的 chunk。换一个关键词，或确认文档内容确实是可检索文本。
                </div>
              ) : (
                <div className="rounded-[16px] border border-dashed border-white/10 p-5 text-sm text-[#777f90]">
                  上传文档后可以在这里测试检索结果。
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
          <CardHeader>
            <CardTitle className="text-sm">文档列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-[#a8adba]">名称</TableHead>
                  <TableHead className="text-[#a8adba]">类型</TableHead>
                  <TableHead className="text-[#a8adba]">Chunks</TableHead>
                  <TableHead className="text-[#a8adba]">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="border-white/10 hover:bg-white/[.035]"
                  >
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#7dd3c7]" />
                        {doc.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#a8adba]">{doc.type}</TableCell>
                    <TableCell className="text-[#a8adba]">
                      {doc.chunkCount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-full border-white/10 text-[#a8adba]"
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {documents.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-white/10 p-5 text-sm text-[#777f90]">
                还没有文档。先粘贴一段资料或选择文件上传。
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
          <CardHeader>
            <CardTitle className="text-sm">处理状态</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id}>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-[#f3f0e8]">{doc.name}</span>
                  <span className="text-[#a8adba]">100%</span>
                </div>
                <Progress value={100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
