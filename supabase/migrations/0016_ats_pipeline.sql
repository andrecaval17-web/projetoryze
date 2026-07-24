-- ATS v2 — proposta aprovada pelo cliente em 2026-07-24: pipeline de status
-- renomeado/expandido e perguntas customizadas por vaga.

-- `status` -> `pipeline_status`: `ats_job_postings` também tem uma coluna
-- `status` com significado diferente (status da vaga, não do candidato) —
-- o rename evita ambiguidade em queries/relatórios. Etapas novas, na ordem
-- do funil real: Triagem, Contato, Entrevista Ryze, Entrevista RH,
-- Contratado, Rejeitado. "Novo" deixa de existir — a primeira etapa agora
-- é "Triagem".
alter table public.ats_applications rename column status to pipeline_status;
alter table public.ats_applications alter column pipeline_status set default 'triagem';
alter table public.ats_applications drop constraint if exists ats_applications_status_check;
alter table public.ats_applications
  add constraint ats_applications_pipeline_status_check
  check (pipeline_status in ('triagem', 'contato', 'entrevista_ryze', 'entrevista_rh', 'contratado', 'rejeitado'));

-- Perguntas de texto livre definidas pelo admin na criação da vaga —
-- respondidas obrigatoriamente pelo candidato na página pública, além dos
-- campos padrão (nome/e-mail/telefone/LinkedIn/currículo). Leitura pública
-- (mesma policy de `ats_job_postings`: a página de candidatura precisa ver
-- as perguntas sem estar logada); escrita sempre via service_role.
create table public.ats_job_questions (
  id uuid primary key default gen_random_uuid(),
  job_posting_id uuid not null references public.ats_job_postings(id) on delete cascade,
  question text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index ats_job_questions_job_posting_id_idx on public.ats_job_questions (job_posting_id);

alter table public.ats_job_questions enable row level security;

create policy "Anyone can view job questions"
  on public.ats_job_questions for select
  to anon, authenticated
  using (true);

-- Respostas do candidato, vinculadas à candidatura. Mesmo padrão de
-- `ats_applications`: RLS habilitada, sem NENHUMA policy — o envio público
-- passa por service_role dentro da mesma Server Action que grava a
-- candidatura, e a leitura interna é sempre service_role depois de
-- requireAdmin().
create table public.ats_application_answers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.ats_applications(id) on delete cascade,
  question_id uuid not null references public.ats_job_questions(id) on delete cascade,
  answer text not null,
  created_at timestamptz not null default now(),
  unique (application_id, question_id)
);

create index ats_application_answers_application_id_idx on public.ats_application_answers (application_id);

alter table public.ats_application_answers enable row level security;
