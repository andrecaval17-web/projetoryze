-- SEO programático (geo pages) — Fase 1: só a infraestrutura + protótipo.
-- Tabela de cidades em vez de JSON estático porque o lote completo (centenas
-- de cidades, por tier de prioridade) precisa ser editável sem novo deploy —
-- mesmo padrão já usado pro resto do conteúdo dinâmico do site (Supabase
-- como fonte de dados, leitura pública via RLS quando o conteúdo não é
-- sensível — ver `ats_job_postings`).
create table if not exists public.geo_cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  uf text not null,
  name text not null,
  uf_name text not null,
  region text not null check (region in ('norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul')),
  -- Prioridade de geração do lote (1 = capitais/grandes centros primeiro) —
  -- não controla nada na Fase 1 (só o protótipo é gerado), mas já fica
  -- pronta pra orientar a ordem do lote completo na Fase 2.
  tier smallint not null default 3 check (tier between 1 and 3),
  -- Kill switch por cidade sem precisar apagar a linha (histórico/SEO).
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (uf, slug)
);

create index if not exists geo_cities_active_tier_idx on public.geo_cities (is_active, tier);

alter table public.geo_cities enable row level security;

-- Conteúdo público de marketing/SEO, sem dado sensível — mesmo racional de
-- `ats_job_postings`: leitura liberada pro anon key, escrita só via
-- service_role (não há tela admin pra isso na Fase 1; cadastro do lote é
-- feito por SQL/script direto no Supabase).
create policy "geo_cities are publicly readable"
  on public.geo_cities for select
  to anon, authenticated
  using (is_active = true);

-- Seed mínimo pro protótipo (Vitória, ES) + um punhado de cidades extras só
-- pra exercitar de verdade as seções de malha interna ("outras cidades") —
-- não é o lote completo, que fica pra quando o protótipo for aprovado.
insert into public.geo_cities (slug, uf, name, uf_name, region, tier) values
  ('vitoria', 'es', 'Vitória', 'Espírito Santo', 'sudeste', 1),
  ('vila-velha', 'es', 'Vila Velha', 'Espírito Santo', 'sudeste', 1),
  ('serra', 'es', 'Serra', 'Espírito Santo', 'sudeste', 1),
  ('sao-paulo', 'sp', 'São Paulo', 'São Paulo', 'sudeste', 1),
  ('rio-de-janeiro', 'rj', 'Rio de Janeiro', 'Rio de Janeiro', 'sudeste', 1),
  ('belo-horizonte', 'mg', 'Belo Horizonte', 'Minas Gerais', 'sudeste', 1)
on conflict (uf, slug) do nothing;
