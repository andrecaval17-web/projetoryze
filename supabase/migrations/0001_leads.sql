create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('consultoria', 'produtos', 'candidato', 'outro')),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text,
  source_page text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Public site visitors can create leads (the contact form), but never read
-- them back — reading is reserved for the admin panel (service role), built
-- in a later phase.
create policy "Anyone can submit a lead"
  on public.leads
  for insert
  to anon
  with check (true);
