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
  run_id uuid,
  name text not null,
  arguments jsonb not null default '{}'::jsonb,
  result jsonb,
  status text not null check (status in ('success', 'error')),
  error text,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  input text not null,
  model text not null,
  status text not null default 'running' check (status in ('running', 'success', 'error')),
  output text,
  error text,
  duration_ms integer,
  created_at timestamptz not null default now(),
  completed_at timestamptz
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

create table if not exists daily_plans (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  summary text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists eval_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('passed', 'failed')),
  total integer not null,
  passed integer not null,
  failed integer not null,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tool_calls_created_at_idx on tool_calls(created_at desc);
create index if not exists tool_calls_run_id_idx on tool_calls(run_id);
create index if not exists agent_runs_created_at_idx on agent_runs(created_at desc);
create index if not exists document_chunks_document_id_idx on document_chunks(document_id);
create index if not exists document_chunks_tokens_idx on document_chunks using gin(tokens);
create index if not exists daily_plans_created_at_idx on daily_plans(created_at desc);
create index if not exists eval_runs_created_at_idx on eval_runs(created_at desc);
