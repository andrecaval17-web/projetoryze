-- Abertura de vaga digital — proposta aprovada pelo cliente em 2026-07-29,
-- substitui a planilha Excel que a empresa cliente preenchia manualmente.
--
-- Fica como registro SEPARADO de `ats_job_postings`, não vira vaga direto:
-- os campos aqui são o que a empresa cliente pediu (estruturado, interno),
-- e a vaga publicada em /vagas/[slug] usa texto livre pensado pro
-- candidato — a equipe sempre revisa/monta esse texto antes de publicar
-- (ver `convertRequestToJobPosting` em src/app/vagas-admin/actions.ts).
--
-- Todos os campos de conteúdo são nullable de propósito: a mesma linha
-- nasce em branco (link vazio pra empresa preencher do zero) ou já
-- pré-preenchida pela equipe (que sabe parte dos dados e só manda o
-- cliente confirmar/ajustar) — `company_name` é o único dado que sempre
-- existe, porque a equipe já sabe pra qual empresa está gerando o link.
create table public.ats_job_requests (
  id uuid primary key default gen_random_uuid(),
  -- Token de uso único (não é um link fixo por empresa — decisão do
  -- cliente: cada abertura que a equipe quer pedir gera seu próprio link,
  -- pra manter rastreável "quando e por que" cada solicitação foi aberta).
  -- Expira só por uso: fica inválido assim que `submitted_at` é setado.
  token text not null unique,
  company_name text not null,

  -- Dados do solicitante
  requester_name text,
  requester_role text,
  requester_department text,
  requester_manager text,

  -- Dados da vaga
  job_title text,
  job_status text check (job_status in ('ocupada', 'em_aberto', 'sigilosa')),
  salary_composition text,
  benefits text,
  bonus text,
  work_schedule text,

  -- Avaliação do candidato buscado
  requires_experience boolean,
  requires_pcd boolean,
  experience_time text check (experience_time in ('ate_6_meses', '6_meses_a_2_anos', '3_anos_ou_mais')),
  education_level text check (education_level in ('fundamental', 'medio', 'graduacao', 'pos_graduacao', 'mestrado_doutorado')),
  education_notes text,
  technical_knowledge text,
  computer_skills text,
  behavioral_traits text[] not null default '{}',
  particularities text,
  candidate_differential text,

  -- Controle: 'pendente' = link gerado, aguardando a empresa preencher/
  -- confirmar; 'em_revisao' = empresa enviou, equipe ainda não converteu;
  -- 'convertida' = já virou vaga formal; 'arquivada' = descartada sem virar vaga.
  status text not null default 'pendente' check (status in ('pendente', 'em_revisao', 'convertida', 'arquivada')),
  converted_job_posting_id uuid references public.ats_job_postings(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

create index ats_job_requests_token_idx on public.ats_job_requests (token);
create index ats_job_requests_status_idx on public.ats_job_requests (status);

alter table public.ats_job_requests enable row level security;

-- Sem NENHUMA policy, de propósito (RLS habilitada = deny implícito pra
-- anon/authenticated) — mesmo padrão de `ats_applications`/
-- `ats_application_answers`. Os dados aqui (composição salarial, perfil
-- buscado) são internos/sensíveis, ao contrário de `ats_job_postings`
-- (que É pra ser público) — por isso NÃO reaproveita a policy `using
-- (true)` de lá. A página pública por token e o painel administrativo
-- leem/escrevem sempre via service_role dentro de Server Actions/Server
-- Components de confiança, nunca direto do client com a anon key.
