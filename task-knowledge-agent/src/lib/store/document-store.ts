import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;

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

function chunkText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    chunks.push(normalized.slice(start, end).trim());

    if (end === normalized.length) {
      break;
    }

    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
}

function tokenize(text: string) {
  const lower = text.toLowerCase();
  const asciiTokens = lower.match(/[a-z0-9_-]+/g) ?? [];
  const chineseTokens = Array.from(lower.matchAll(/[\u4e00-\u9fff]{2,}/g))
    .map((match) => match[0])
    .flatMap((word) => {
      const tokens = [word];

      for (let index = 0; index < word.length - 1; index += 1) {
        tokens.push(word.slice(index, index + 2));
      }

      return tokens;
    });

  return Array.from(new Set([...asciiTokens, ...chineseTokens]));
}

function scoreChunk(
  queryTokens: string[],
  chunkTokens: string[],
  content: string,
  query: string,
) {
  const tokenSet = new Set(chunkTokens);
  let score = 0;

  for (const token of queryTokens) {
    if (tokenSet.has(token)) {
      score += token.length > 2 ? 3 : 1;
    }
  }

  if (content.includes(query)) {
    score += 10;
  }

  return score;
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
