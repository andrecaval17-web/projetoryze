-- Painel de evolução + checklist marcável (proposta aprovada pelo cliente
-- em 2026-07-20 — ver HANDOFF.md).

-- linkedin_analyses deixa de ser "1 por usuário" (upsert apagava o
-- histórico a cada análise nova — não dava pra mostrar pontuação ao longo
-- do tempo). Vira histórico, igual resume_versions/interview_sessions.
alter table public.linkedin_analyses drop constraint if exists linkedin_analyses_user_id_key;
create index if not exists linkedin_analyses_user_id_idx on public.linkedin_analyses (user_id);

alter table public.linkedin_analyses
  add column if not exists score integer,
  add column if not exists next_steps jsonb;

-- Parecer final da entrevista extraído do transcript (antes só existia
-- como a última mensagem dentro do jsonb do transcript, sem campo
-- próprio) + checklist de próximos passos, no mesmo formato marcável do
-- LinkedIn: array de {text, done}.
alter table public.interview_sessions
  add column if not exists final_assessment text,
  add column if not exists next_steps jsonb;
