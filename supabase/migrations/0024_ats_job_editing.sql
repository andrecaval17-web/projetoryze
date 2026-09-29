-- Edição de vaga já publicada — pedido do cliente em 2026-08-13: depois de
-- divulgar uma vaga não havia como voltar e ajustar nada (o caso concreto foi
-- esquecer de adicionar perguntas customizadas antes de divulgar). A decisão
-- original de "perguntas só na criação" (ver 0016_ats_pipeline.sql) cai aqui.

-- 1. Soft delete de pergunta.
--
-- Remover uma pergunta NÃO pode ser DELETE: `ats_application_answers`
-- referencia `ats_job_questions` com `on delete cascade` (0016), então apagar
-- uma pergunta levaria junto, em silêncio, todas as respostas que candidatos
-- já deram pra ela. `archived_at` tira a pergunta do formulário público sem
-- tocar em nada que já foi respondido — o histórico do pipeline continua
-- íntegro.
--
-- A policy pública de select (`using (true)`) continua valendo pra perguntas
-- arquivadas: quem filtra é a aplicação. Não é problema — o conteúdo de uma
-- pergunta de vaga não é sensível, e não existe rota pública que liste
-- perguntas fora do contexto de uma vaga.
alter table public.ats_job_questions
  add column if not exists archived_at timestamptz;

-- 2. Guard-rail no banco: cascade -> restrict.
--
-- A aplicação nunca deleta pergunta com resposta (arquiva), mas o cascade
-- deixava o estrago a um `.delete()` distraído de distância — e perda de
-- resposta de candidato é irreversível. Com `restrict`, esse erro vira uma
-- exceção barulhenta em vez de dados sumindo sem ninguém notar.
--
-- Não existe hoje nenhuma rota que apague vaga ou candidatura (só
-- `admin_users` tem DELETE no projeto), então isto não bloqueia nenhum fluxo
-- atual. Se um dia existir "excluir vaga", ela vai precisar apagar as
-- respostas explicitamente antes das perguntas, em vez de confiar na ordem
-- em que o Postgres resolve cascades concorrentes.
alter table public.ats_application_answers
  drop constraint if exists ats_application_answers_question_id_fkey;
alter table public.ats_application_answers
  add constraint ats_application_answers_question_id_fkey
  foreign key (question_id) references public.ats_job_questions(id) on delete restrict;

-- 3. Marca só as edições de CONTEÚDO da vaga.
--
-- O score de aderência é calculado no envio da candidatura, contra a
-- descrição/requisitos vigentes naquele momento (ver src/app/vagas/[slug]/
-- actions.ts). Editar os requisitos depois faz candidato antigo e candidato
-- novo serem pontuados por réguas diferentes — e o kanban ordena por score.
-- Nada é recalculado (custaria uma chamada de IA por candidatura); o pipeline
-- só sinaliza quando a vaga mudou DEPOIS daquela candidatura.
--
-- Coluna separada de `updated_at` de propósito: `updated_at` também é tocada
-- por mudança de status (aberta/pausada/encerrada), o que geraria alarme
-- falso em toda vaga que só foi pausada.
alter table public.ats_job_postings
  add column if not exists content_updated_at timestamptz;

-- Backfill com `created_at`, não com `now()`: as vagas que já existem nunca
-- foram editadas, e default now() marcaria todas as candidaturas atuais como
-- "vaga editada depois" logo na primeira migração.
update public.ats_job_postings
  set content_updated_at = created_at
  where content_updated_at is null;

alter table public.ats_job_postings
  alter column content_updated_at set not null,
  alter column content_updated_at set default now();
