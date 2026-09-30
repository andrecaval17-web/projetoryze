-- Rastreamento de cliques no CTA de WhatsApp das páginas geo
-- (/[tipo]/[uf]/[cidade]) — desde que esses CTAs passaram a abrir o
-- WhatsApp direto (em vez de /contato), não sobra nenhum evento no nosso
-- banco. Sem dado de visitante (IP, user-agent) de propósito: é clique
-- anônimo de página pública, não precisa de mais que isso pra contar
-- volume por página/tipo de serviço.
create table if not exists public.geo_whatsapp_clicks (
  id uuid primary key default gen_random_uuid(),
  page_type text not null,
  uf text not null,
  city_slug text not null,
  page_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists geo_whatsapp_clicks_page_type_idx on public.geo_whatsapp_clicks (page_type);
create index if not exists geo_whatsapp_clicks_created_at_idx on public.geo_whatsapp_clicks (created_at);

alter table public.geo_whatsapp_clicks enable row level security;

-- Mesmo padrão de `leads`: qualquer visitante pode registrar o clique
-- (insert-only, via anon key), ninguém lê de volta pelo client — leitura é
-- sempre service_role no admin. A validação de conteúdo (page_type contra
-- o catálogo real, formato de uf/city_slug) acontece antes disso, no
-- handler que faz o insert (src/app/api/geo-whatsapp-click/route.ts) — RLS
-- aqui só garante que ninguém lê ou escreve fora desse único caminho.
create policy "Anyone can log a geo whatsapp click"
  on public.geo_whatsapp_clicks
  for insert
  to anon
  with check (true);
