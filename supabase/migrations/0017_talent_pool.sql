-- Banco de Talentos — proposta aprovada pelo cliente em 2026-07-24.
-- Alimentado por duas fontes: cadastro de candidato (qualquer plano) e
-- candidatura pública a uma vaga do ATS. Cada evento gera sua própria
-- linha (não mescla as duas fontes numa só) — uma pessoa pode aparecer mais
-- de uma vez (ex: se cadastrou como candidata E se candidatou a uma vaga).
--
-- Mesmo padrão de `ats_applications`/`admin_users`: RLS habilitada, SEM
-- NENHUMA policy — escrita e leitura sempre via service_role, depois de
-- requireAdmin() (leitura) ou dentro das Server Actions de confiança do
-- próprio fluxo de cadastro/candidatura (escrita).
create table public.talent_pool (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('cadastro', 'candidatura_vaga')),
  candidate_user_id uuid references auth.users(id) on delete set null,
  ats_application_id uuid references public.ats_applications(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  linkedin_url text,
  target_role text,
  skills text[] not null default '{}'::text[],
  summary text,
  resume_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index talent_pool_candidate_user_id_idx on public.talent_pool (candidate_user_id);
create index talent_pool_source_idx on public.talent_pool (source);
create index talent_pool_skills_idx on public.talent_pool using gin (skills);

alter table public.talent_pool enable row level security;
