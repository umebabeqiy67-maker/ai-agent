import { localStore } from "@/lib/store/local-store";
import { postgresStore } from "@/lib/store/postgres-store";
import type { AppStore } from "@/lib/store/types";

export type StorageMode = "postgres" | "local";

export function getStorageMode(): StorageMode {
  const mode = process.env.STORAGE_MODE ?? "postgres";

  if (mode === "postgres" || mode === "local") {
    return mode;
  }

  throw new Error(`Unsupported STORAGE_MODE: ${mode}`);
}

export function getStore(): AppStore {
  const mode = getStorageMode();

  if (mode === "local") {
    return localStore;
  }

  return postgresStore;
}
