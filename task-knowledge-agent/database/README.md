# Database setup

This project is designed to run against a real Postgres database in normal development and deployment.

Recommended learning/demo setup:

```text
Supabase Free + Postgres
```

## 1. Create tables

Open the Supabase SQL Editor and run:

```sql
-- paste database/schema.sql here
```

The schema creates ordinary business tables first:

- `conversations`
- `messages`
- `tasks`
- `tool_calls`
- `documents`
- `document_chunks`

It also enables `pgvector` and includes a nullable `embedding vector(1536)` column for the next RAG upgrade.

## 2. Environment variables

For real database mode:

```env
STORAGE_MODE=postgres
DATABASE_URL=postgresql://...
DEEPSEEK_API_KEY=...
```

For explicit local test mode only:

```env
STORAGE_MODE=local
DEEPSEEK_API_KEY=...
```

Local mode writes JSON files to `data/` and is only a test adapter. Production and real learning should use `postgres`.
