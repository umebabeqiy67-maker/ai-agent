import { getSql } from "@/lib/store/postgres/client";
import { chunkText, scoreChunk, tokenize } from "@/lib/store/shared/text";
import type {
  AppStore,
  StoredChunk,
  StoredConversation,
  StoredDocument,
  StoredMessage,
  StoredTask,
  StoredToolCall,
} from "@/lib/store/types";

const DEFAULT_CONVERSATION_ID = "default";

export const postgresStore: AppStore = {
  chat: {
    async getCurrentConversation() {
      const sql = getSql();
      const conversation = await ensureDefaultConversation();
      const rows = await sql`
        select id, conversation_id, role, content, model, created_at
        from messages
        where conversation_id = ${conversation.id}
        order by created_at asc
      `;

      return {
        conversation,
        messages: rows.map(mapMessage),
      };
    },
    async appendMessage(input) {
      const sql = getSql();
      const conversation = await ensureDefaultConversation();
      const conversationId = input.conversationId ?? conversation.id;
      const rows = await sql`
        insert into messages (conversation_id, role, content, model)
        values (${conversationId}, ${input.role}, ${input.content}, ${input.model ?? null})
        returning id, conversation_id, role, content, model, created_at
      `;

      await sql`
        update conversations
        set
          title = case
            when title = 'New conversation' and ${input.role} = 'user'
            then left(${input.content}, 32)
            else title
          end,
          updated_at = now()
        where id = ${conversationId}
      `;

      return mapMessage(rows[0]);
    },
  },
  tasks: {
    async create(input) {
      const sql = getSql();
      const rows = await sql`
        insert into tasks (title, description, priority, due_date, source, source_message)
        values (
          ${input.title},
          ${input.description ?? null},
          ${input.priority ?? "medium"},
          ${input.dueDate ?? null},
          'agent',
          ${input.sourceMessage ?? null}
        )
        returning *
      `;

      return mapTask(rows[0]);
    },
    async list(filter) {
      const sql = getSql();
      const rows = filter?.status
        ? await sql`select * from tasks where status = ${filter.status} order by created_at desc`
        : await sql`select * from tasks order by created_at desc`;

      return rows.map(mapTask);
    },
    async update(input) {
      const sql = getSql();
      const rows = await sql`
        update tasks
        set
          title = coalesce(${input.title ?? null}, title),
          status = coalesce(${input.status ?? null}, status),
          priority = coalesce(${input.priority ?? null}, priority),
          updated_at = now()
        where id = ${input.id}
        returning *
      `;

      if (!rows[0]) {
        throw new Error(`Task not found: ${input.id}`);
      }

      return mapTask(rows[0]);
    },
  },
  toolCalls: {
    async save(input) {
      const sql = getSql();
      const rows = await sql`
        insert into tool_calls (name, arguments, result, status, error)
        values (
          ${input.name},
          ${JSON.stringify(input.arguments ?? {})}::jsonb,
          ${input.result === undefined ? null : JSON.stringify(input.result)}::jsonb,
          ${input.status},
          ${input.error ?? null}
        )
        returning *
      `;

      return mapToolCall(rows[0]);
    },
    async list() {
      const sql = getSql();
      const rows = await sql`select * from tool_calls order by created_at desc`;

      return rows.map(mapToolCall);
    },
  },
  documents: {
    async create(input) {
      const sql = getSql();
      const rawChunks = chunkText(input.content);
      const documentRows = await sql`
        insert into documents (name, type, status, chunk_count)
        values (${input.name}, ${input.type ?? "text/plain"}, 'indexed', ${rawChunks.length})
        returning *
      `;
      const document = mapDocument(documentRows[0]);
      const chunks: StoredChunk[] = [];

      for (const [chunkIndex, content] of rawChunks.entries()) {
        const tokens = tokenize(content);
        const chunkRows = await sql`
          insert into document_chunks (
            document_id,
            document_name,
            chunk_index,
            content,
            tokens
          )
          values (
            ${document.id},
            ${document.name},
            ${chunkIndex},
            ${content},
            ${tokens}
          )
          returning *
        `;
        chunks.push(mapChunk(chunkRows[0]));
      }

      return { document, chunks };
    },
    async list() {
      const sql = getSql();
      const rows = await sql`select * from documents order by created_at desc`;

      return rows.map(mapDocument);
    },
    async search(input) {
      const sql = getSql();
      const queryTokens = tokenize(input.query);
      const topK = input.topK ?? 5;

      if (queryTokens.length === 0) {
        return [];
      }

      const rows = await sql`
        select *
        from document_chunks
        where tokens && ${queryTokens}
        order by created_at desc
        limit 80
      `;

      return rows
        .map((row) => {
          const chunk = mapChunk(row);
          return {
            ...chunk,
            score: scoreChunk(queryTokens, chunk.tokens, chunk.content, input.query),
          };
        })
        .filter((chunk) => chunk.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    },
  },
};

async function ensureDefaultConversation(): Promise<StoredConversation> {
  const sql = getSql();
  const rows = await sql`
    insert into conversations (id, title)
    values (${DEFAULT_CONVERSATION_ID}, 'New conversation')
    on conflict (id) do update set id = excluded.id
    returning id, title, created_at, updated_at
  `;

  return mapConversation(rows[0]);
}

function mapConversation(row: Record<string, unknown>): StoredConversation {
  return {
    id: String(row.id),
    title: String(row.title),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapMessage(row: Record<string, unknown>): StoredMessage {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    role: row.role as StoredMessage["role"],
    content: String(row.content),
    model: row.model ? String(row.model) : undefined,
    createdAt: toIso(row.created_at),
  };
}

function mapTask(row: Record<string, unknown>): StoredTask {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    status: row.status as StoredTask["status"],
    priority: row.priority as StoredTask["priority"],
    dueDate: row.due_date ? String(row.due_date).slice(0, 10) : undefined,
    source: row.source as StoredTask["source"],
    sourceMessage: row.source_message ? String(row.source_message) : undefined,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapToolCall(row: Record<string, unknown>): StoredToolCall {
  return {
    id: String(row.id),
    name: String(row.name),
    arguments: row.arguments,
    result: row.result ?? undefined,
    status: row.status as StoredToolCall["status"],
    error: row.error ? String(row.error) : undefined,
    createdAt: toIso(row.created_at),
  };
}

function mapDocument(row: Record<string, unknown>): StoredDocument {
  return {
    id: String(row.id),
    name: String(row.name),
    type: String(row.type),
    status: row.status as "indexed",
    chunkCount: Number(row.chunk_count),
    createdAt: toIso(row.created_at),
  };
}

function mapChunk(row: Record<string, unknown>): StoredChunk {
  return {
    id: String(row.id),
    documentId: String(row.document_id),
    documentName: String(row.document_name),
    chunkIndex: Number(row.chunk_index),
    content: String(row.content),
    tokens: Array.isArray(row.tokens) ? row.tokens.map(String) : [],
    createdAt: toIso(row.created_at),
  };
}

function toIso(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}
