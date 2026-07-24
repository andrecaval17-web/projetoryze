-- ATS simples (recrutamento interno) — proposta aprovada pelo cliente em
-- 2026-07-24. Prefixo `ats_` deliberado: já existe uma tabela
-- `job_applications` no projeto (envelope de adaptação de currículo por
-- vaga, escopo do candidato) sem relação nenhuma com isto — o prefixo evita
-- qualquer confusão entre os dois conceitos.

-- Vaga publicada pelo time. Leitura pública (a página /vagas/[slug] não
-- exige login), mas a policy de select libera TODAS as vagas — não só as
-- abertas — porque a própria página pública precisa mostrar o estado
-- "pausada/encerrada" pra quem chega com o link de uma vaga que já fechou.
-- Não há como "listar" vagas por essa policy (não existe rota de listagem
-- pública), só buscar por slug exato, e o conteúdo da vaga não é sensível.
-- Escrita sempre via service_role, depois de requireAdmin() — igual
-- `admin_users`.
create table if not exists public.ats_job_postings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  requirements text not null,
  status text not null default 'aberta' check (status in ('aberta', 'pausada', 'encerrada')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ats_job_postings enable row level security;

create policy "Anyone can view a job posting by slug"
  on public.ats_job_postings for select
  to anon, authenticated
  using (true);

-- Candidatura recebida pelo formulário público. Sem NENHUMA policy de
-- propósito (RLS habilitada = deny implícito pra anon/authenticated) — o
-- envio público passa por service_role dentro da Server Action (que já fez
-- a extração de PDF e a chamada de IA no mesmo request de confiança), e a
-- leitura/gestão interna também é sempre service_role depois de
-- requireAdmin(). Mesmo padrão de `admin_users`/`ai_usage_log`.
create table if not exists public.ats_applications (
  id uuid primary key default gen_random_uuid(),
  job_posting_id uuid not null references public.ats_job_postings(id) on delete cascade,
  -- Cross-reference informativo, não funcional: só preenchido se o e-mail
  -- da candidatura bater com uma conta Ryze já existente. Não cria nenhum
  -- vínculo automático com o funil de candidato (currículo/LinkedIn/
  -- entrevista) — são jornadas propositalmente separadas.
  candidate_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  resume_storage_path text not null,
  linkedin_url text,
  score integer,
  score_reasoning text,
  status text not null default 'novo' check (status in ('novo', 'triagem', 'entrevista', 'contratado', 'rejeitado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ats_applications_job_posting_id_idx on public.ats_applications (job_posting_id);
create index if not exists ats_applications_score_idx on public.ats_applications (score);

alter table public.ats_applications enable row level security;

-- Bucket privado pros PDFs de currículo enviados pelo formulário público —
-- primeiro uso de Supabase Storage neste projeto. Upload e leitura (URL
-- assinada, sob demanda, no painel admin) sempre via service_role, por
-- isso nenhuma policy de storage.objects é necessária.
insert into storage.buckets (id, name, public)
values ('ats-resumes', 'ats-resumes', false)
on conflict (id) do nothing;

-- ai_usage_log precisa registrar o score de aderência calculado no envio
-- público da candidatura — sem usuário autenticado pra atribuir a chamada,
-- então user_id vira opcional só pra esse caso ('ats').
alter table public.ai_usage_log alter column user_id drop not null;

alter table public.ai_usage_log drop constraint if exists ai_usage_log_feature_check;
alter table public.ai_usage_log
  add constraint ai_usage_log_feature_check check (feature in ('resume', 'linkedin', 'interview', 'ats'));
