-- Fluxo guiado Currículo -> Análise de LinkedIn -> Simulação de Entrevista,
-- pra mesma vaga (Opção B aprovada pelo cliente em 2026-07-20 — ver
-- HANDOFF.md). `job_applications` é o "envelope" que amarra as três etapas
-- SEM forçar a análise de LinkedIn a ser refeita por vaga: ela continua
-- "1 por usuário" (linkedin_analyses não muda de modelo), só passa a poder
-- ser referenciada por uma ou mais vagas.
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_title text not null,
  job_description text not null,
  resume_version_id uuid references public.resume_versions(id) on delete set null,
  linkedin_analysis_id uuid references public.linkedin_analyses(id) on delete set null,
  interview_session_id uuid references public.interview_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_applications_user_id_idx on public.job_applications (user_id);

alter table public.job_applications enable row level security;

create policy "Users can view their own job applications"
  on public.job_applications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own job applications"
  on public.job_applications for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own job applications"
  on public.job_applications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Vínculo de volta, pra achar a vaga a partir de uma versão de currículo sem
-- precisar de join pela linha de job_applications (o histórico por vaga na
-- tela de Currículo já lista resume_versions diretamente). Nullable: versões
-- geradas antes desta migration continuam sem vínculo, sem quebrar nada.
alter table public.resume_versions
  add column if not exists job_application_id uuid references public.job_applications(id) on delete set null;

-- interview_sessions nunca guardou a vaga/área digitada pelo candidato (só
-- existia como estado do componente no browser — se recarregasse a página,
-- perdia). Agora persiste, e passa a poder ser aberta já pré-preenchida
-- quando o candidato chega pela Etapa 3 do fluxo guiado.
alter table public.interview_sessions
  add column if not exists job_application_id uuid references public.job_applications(id) on delete set null,
  add column if not exists job_context text,
  add column if not exists finished boolean not null default false;
