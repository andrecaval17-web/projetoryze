-- Novo modelo visual de currículo "Elegante" (coluna lateral à direita,
-- traços finos) — 5ª opção, junto de basico/moderno/executivo/criativo.
-- `template_slug` tem uma constraint de check (0005_resume_structured.sql)
-- que precisa ser recriada com o valor novo — Postgres não deixa alterar a
-- condição de um check existente, só dropar e recriar.
alter table public.resume_versions
  drop constraint if exists resume_versions_template_slug_check;

alter table public.resume_versions
  add constraint resume_versions_template_slug_check
    check (template_slug in ('basico', 'moderno', 'executivo', 'criativo', 'elegante'));
