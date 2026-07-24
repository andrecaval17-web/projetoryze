-- Fase 4b: agendamento da sessão mensal de mentoria via Cal.com.
--
-- Uma linha por sessão agendada (não "1 por usuário") — histórico completo,
-- igual ao padrão de resume_versions. `status` cobre o ciclo de vida real de
-- uma reserva do Cal.com: 'confirmed' (ativa), 'cancelled' (cancelada pelo
-- candidato ou pelo consultor) e 'rescheduled' (superada por um
-- reagendamento — a nova reserva vira uma linha nova com status 'confirmed').
--
-- Escrita só via webhook (service_role), igual a `subscriptions`: o
-- candidato nunca insere/atualiza essa tabela diretamente — quem manda a
-- verdade é o Cal.com via webhook assinado.
create table if not exists public.mentoring_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cal_booking_uid text not null unique,
  scheduled_at timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'rescheduled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mentoring_sessions_user_id_idx on public.mentoring_sessions (user_id);
create index if not exists mentoring_sessions_scheduled_at_idx on public.mentoring_sessions (scheduled_at);

alter table public.mentoring_sessions enable row level security;

create policy "Users can view their own mentoring sessions"
  on public.mentoring_sessions for select
  to authenticated
  using (auth.uid() = user_id);
