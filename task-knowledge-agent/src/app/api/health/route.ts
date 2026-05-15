import { getStorageMode } from "@/lib/store";
import { getSql } from "@/lib/store/postgres/client";

export const runtime = "nodejs";

export async function GET() {
  const storageMode = getStorageMode();
  const checks = {
    storageMode,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasDeepSeekApiKey: Boolean(process.env.DEEPSEEK_API_KEY),
    database: "skipped",
  };

  if (storageMode !== "postgres") {
    return Response.json(checks);
  }

  if (!process.env.DATABASE_URL) {
    return Response.json(
      {
        ...checks,
        database: "missing DATABASE_URL",
      },
      { status: 500 },
    );
  }

  try {
    const sql = getSql();
    await sql`select 1`;

    return Response.json({
      ...checks,
      database: "ok",
    });
  } catch (error) {
    return Response.json(
      {
        ...checks,
        database: "failed",
        error: error instanceof Error ? error.message : "Unknown database error.",
      },
      { status: 500 },
    );
  }
}
