-- Currículo com IA vira estruturado + modelos visuais + edição + PDF.
-- Substitui a coluna de texto livre (`generated_content`) por um JSON
-- estruturado, e adiciona título da vaga e modelo visual escolhido. Só
-- existem linhas fictícias de teste até aqui — ALTER direto em vez de
-- migração de dados.

alter table public.resume_versions
  drop column if exists generated_content;

alter table public.resume_versions
  add column if not exists resume_data jsonb not null default '{}'::jsonb,
  add column if not exists job_title text,
  add column if not exists template_slug text not null default 'basico'
    check (template_slug in ('basico', 'moderno', 'executivo', 'criativo')),
  add column if not exists updated_at timestamptz not null default now();

-- O default '{}'::jsonb em resume_data é só pra permitir o ALTER em cima de
-- linhas existentes sem quebrar a constraint not null — toda linha nova
-- sempre vem com o JSON de verdade preenchido pela Server Action.
alter table public.resume_versions
  alter column resume_data drop default;

-- Faltava policy de update — necessária agora porque o candidato edita o
-- currículo gerado (o preview reflete a edição, que é salva na mesma linha,
-- não cria uma versão nova a cada campo alterado).
drop policy if exists "Users can update their own resume versions" on public.resume_versions;
create policy "Users can update their own resume versions"
  on public.resume_versions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
