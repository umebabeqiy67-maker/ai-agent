create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists conversations (
  id text primary key,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null references conversations(id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant', 'tool')),
  content text not null,
  model text,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  source text not null default 'agent' check (source in ('agent', 'manual')),
  source_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tool_calls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  arguments jsonb not null default '{}'::jsonb,
  result jsonb,
  status text not null check (status in ('success', 'error')),
  error text,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'text/plain',
  status text not null default 'indexed',
  chunk_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  document_name text not null,
  chunk_index integer not null,
  content text not null,
  tokens text[] not null default '{}',
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tool_calls_created_at_idx on tool_calls(created_at desc);
create index if not exists document_chunks_document_id_idx on document_chunks(document_id);
create index if not exists document_chunks_tokens_idx on document_chunks using gin(tokens);
