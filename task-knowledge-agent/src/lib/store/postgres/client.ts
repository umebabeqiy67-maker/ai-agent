import postgres from "postgres";

let client: postgres.Sql | null = null;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required when STORAGE_MODE=postgres.");
  }

  client ??= postgres(process.env.DATABASE_URL, {
    ssl: "require",
    max: 5,
  });

  return client;
}
