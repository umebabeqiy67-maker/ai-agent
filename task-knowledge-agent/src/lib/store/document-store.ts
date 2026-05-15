import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chunkText, scoreChunk, tokenize } from "@/lib/store/shared/text";

export type StoredDocument = {
  id: string;
  name: string;
  type: string;
  status: "indexed";
  chunkCount: number;
  createdAt: string;
};

export type StoredChunk = {
  id: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  tokens: string[];
  createdAt: string;
};

type DocumentStoreData = {
  documents: StoredDocument[];
  chunks: StoredChunk[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "documents.json");
export async function createDocument(input: {
  name: string;
  type?: string;
  content: string;
}) {
  const store = await readStore();
  const now = new Date().toISOString();
  const documentId = crypto.randomUUID();
  const rawChunks = chunkText(input.content);
  const chunks: StoredChunk[] = rawChunks.map((content, chunkIndex) => ({
    id: crypto.randomUUID(),
    documentId,
    documentName: input.name,
    chunkIndex,
    content,
    tokens: tokenize(content),
    createdAt: now,
  }));
  const document: StoredDocument = {
    id: documentId,
    name: input.name,
    type: input.type ?? "text/plain",
    status: "indexed",
    chunkCount: chunks.length,
    createdAt: now,
  };

  store.documents.unshift(document);
  store.chunks.push(...chunks);
  await writeStore(store);

  return { document, chunks };
}

export async function listDocuments() {
  const store = await readStore();
  return store.documents;
}

export async function searchDocuments(input: { query: string; topK?: number }) {
  const store = await readStore();
  const queryTokens = tokenize(input.query);
  const topK = input.topK ?? 5;

  if (queryTokens.length === 0) {
    return [];
  }

  return store.chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(queryTokens, chunk.tokens, chunk.content, input.query),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ score, ...chunk }) => ({
      ...chunk,
      score,
    }));
}

export async function deleteDocument(id: string) {
  const store = await readStore();
  const document = store.documents.find((item) => item.id === id);

  if (!document) {
    throw new Error(`Document not found: ${id}`);
  }

  store.documents = store.documents.filter((item) => item.id !== id);
  store.chunks = store.chunks.filter((chunk) => chunk.documentId !== id);
  await writeStore(store);

  return document;
}

async function readStore(): Promise<DocumentStoreData> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as DocumentStoreData;
  } catch {
    return {
      documents: [],
      chunks: [],
    };
  }
}

async function writeStore(store: DocumentStoreData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}
