import { FileText, Search, UploadCloud } from "lucide-react";

import { AppShell } from "@/components/app-shell";
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

const documents = [
  {
    name: "AI Agent 学习路线.md",
    type: "Markdown",
    chunks: 42,
    status: "Indexed",
    progress: 100,
  },
  {
    name: "任务与知识库 Agent 开发计划.md",
    type: "Markdown",
    chunks: 64,
    status: "Indexed",
    progress: 100,
  },
  {
    name: "RAG notes.pdf",
    type: "PDF",
    chunks: 18,
    status: "Embedding",
    progress: 72,
  },
];

export default function DocumentsPage() {
  return (
    <AppShell
      title="Documents"
      description="上传资料、查看解析状态，并验证 Agent 能检索到的上下文。"
    >
      <div className="grid gap-5 p-6">
        <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
          <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-base font-semibold">知识库入口</h2>
              <p className="mt-1 text-sm text-[#a8adba]">
                第一版支持 Markdown、TXT、PDF。后续可扩展网页抓取和 GitHub 仓库。
              </p>
            </div>
            <Button className="rounded-[14px] bg-gradient-to-br from-[#7dd3c7] to-[#d9f99d] font-bold text-[#111318] hover:brightness-105">
              <UploadCloud className="h-4 w-4" />
              上传文档
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm">文档列表</CardTitle>
                <div className="relative w-64 max-w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777f90]" />
                  <Input
                    className="rounded-xl border-white/10 bg-white/[.045] pl-9 text-[#f3f0e8] placeholder:text-[#777f90]"
                    placeholder="搜索文档"
                  />
                </div>
              </div>
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
                      key={doc.name}
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
                        {doc.chunks}
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
            </CardContent>
          </Card>

          <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
            <CardHeader>
              <CardTitle className="text-sm">处理状态</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {documents.map((doc) => (
                <div key={doc.name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-[#f3f0e8]">{doc.name}</span>
                    <span className="text-[#a8adba]">{doc.progress}%</span>
                  </div>
                  <Progress value={doc.progress} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
