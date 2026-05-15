import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export const runtime = "nodejs";

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
    const text = await file.text();
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
