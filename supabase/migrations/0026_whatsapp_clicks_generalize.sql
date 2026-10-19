-- Generaliza `geo_whatsapp_clicks` (só páginas geo) pra `whatsapp_clicks`,
-- cobrindo qualquer botão de WhatsApp do site (cabeçalho, rodapé, botão
-- flutuante, CTAs de consultoria/produtos/empresas, páginas geo). `page_type`/
-- `uf`/`city_slug` eram específicos de página geo e não existem pra um clique
-- no cabeçalho ou no rodapé — `page_path` já carrega a localização completa
-- (inclusive geo, ex: "/consultoria-de-rh/ba/salvador") sem precisar dos 3
-- campos separados. `button` identifica qual botão foi clicado na página
-- (ver src/lib/whatsapp-click.ts para a lista fechada de valores aceitos).
alter table public.geo_whatsapp_clicks rename to whatsapp_clicks;

alter table public.whatsapp_clicks add column if not exists button text;

-- Linhas gravadas antes desta migration (só podiam vir de página geo) —
-- rotulando como "hero_primary" o mais próximo do botão real que existia
-- lá (CTA principal da página geo que, pra tipos B2B, já era o WhatsApp).
update public.whatsapp_clicks set button = 'hero_primary' where button is null;

alter table public.whatsapp_clicks alter column button set not null;

alter table public.whatsapp_clicks drop column if exists page_type;
alter table public.whatsapp_clicks drop column if exists uf;
alter table public.whatsapp_clicks drop column if exists city_slug;

drop index if exists geo_whatsapp_clicks_page_type_idx;
alter index if exists geo_whatsapp_clicks_created_at_idx rename to whatsapp_clicks_created_at_idx;
create index if not exists whatsapp_clicks_button_idx on public.whatsapp_clicks (button);

alter policy "Anyone can log a geo whatsapp click" on public.whatsapp_clicks
  rename to "Anyone can log a whatsapp click";
