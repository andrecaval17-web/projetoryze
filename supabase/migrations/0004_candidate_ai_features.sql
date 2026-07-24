-- Fase 4: currículo com IA, análise de LinkedIn, simulação de entrevista.
-- Quatro tabelas, um propósito cada:

-- Uma linha por geração de currículo — histórico completo, nunca
-- sobrescrito (diferente de candidate_profiles/linkedin_analyses, que são
-- "1 por usuário"). Isso é o que permite o candidato ver versões anteriores
-- adaptadas para vagas diferentes.
create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_description text not null,
  generated_content text not null,
  created_at timestamptz not null default now()
);

create index if not exists resume_versions_user_id_idx on public.resume_versions (user_id);

alter table public.resume_versions enable row level security;

create policy "Users can view their own resume versions"
  on public.resume_versions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own resume versions"
  on public.resume_versions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Uma linha por usuário (upsert) — só o resultado mais recente importa, sem
-- histórico, conforme decidido no escopo desta etapa.
create table if not exists public.linkedin_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  analysis text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.linkedin_analyses enable row level security;

create policy "Users can view their own linkedin analysis"
  on public.linkedin_analyses for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own linkedin analysis"
  on public.linkedin_analyses for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own linkedin analysis"
  on public.linkedin_analyses for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Uma linha por sessão de entrevista; o transcript cresce via update
-- conforme a conversa avança (pergunta/resposta), não é reescrito do zero
-- a cada turno.
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transcript jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_sessions_user_id_idx on public.interview_sessions (user_id);

alter table public.interview_sessions enable row level security;

create policy "Users can view their own interview sessions"
  on public.interview_sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own interview sessions"
  on public.interview_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own interview sessions"
  on public.interview_sessions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Log interno de uso de IA para acompanhamento de custo/volume — não é dado
-- do candidato sobre si mesmo, é telemetria operacional. RLS habilitada e
-- SEM policy para anon/authenticated de propósito: só o webhook/route
-- handlers gravam aqui via service_role (que ignora RLS). Leitura fica para
-- o painel admin da Fase 5, também via service_role.
create table if not exists public.ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (feature in ('resume', 'linkedin', 'interview')),
  model text not null,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_log_user_id_idx on public.ai_usage_log (user_id);
create index if not exists ai_usage_log_feature_idx on public.ai_usage_log (feature);

alter table public.ai_usage_log enable row level security;
