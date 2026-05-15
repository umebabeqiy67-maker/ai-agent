import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export const runtime = "nodejs";

const TEXT_FILE_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
]);

const TEXT_FILE_EXTENSIONS = [
  ".txt",
  ".md",
  ".markdown",
  ".csv",
  ".json",
  ".log",
  ".html",
  ".css",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".xml",
  ".yaml",
  ".yml",
];

export async function GET() {
  const documents = await getStore().documents.list();

  return NextResponse.json({ documents });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");
  const content = formData.get("content");
  const name = formData.get("name");

  if (file instanceof File) {
    if (!isSupportedTextFile(file)) {
      return NextResponse.json(
        {
          error:
            "当前只支持文本类文件。PDF 需要先接入 PDF parser 后才能进入知识库。",
        },
        { status: 415 },
      );
    }

    const text = await file.text();

    if (!text.trim()) {
      return NextResponse.json(
        { error: "文件内容为空，无法进入知识库。" },
        { status: 400 },
      );
    }

    const result = await getStore().documents.create({
      name: file.name,
      type: file.type || "text/plain",
      content: text,
    });

    return NextResponse.json(result);
  }

  if (typeof content === "string" && content.trim()) {
    const result = await getStore().documents.create({
      name: typeof name === "string" && name.trim() ? name : "Untitled note",
      type: "text/plain",
      content,
    });

    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: "Upload a text file or provide document content." },
    { status: 400 },
  );
}

function isSupportedTextFile(file: File) {
  const lowerName = file.name.toLowerCase();

  return (
    TEXT_FILE_TYPES.has(file.type) ||
    TEXT_FILE_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
  );
}
