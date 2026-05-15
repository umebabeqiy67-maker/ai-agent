import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Document id is required." }, { status: 400 });
  }

  try {
    const document = await getStore().documents.delete(id);
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete document.",
      },
      { status: 404 },
    );
  }
}
