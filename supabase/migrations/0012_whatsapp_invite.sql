-- Convite pro grupo de WhatsApp de vagas, disparado (banner + e-mail) na
-- primeira vez que o candidato tem um currículo de verdade pra ver —
-- qualquer plano, só uma vez por usuário. O timestamp em si é o único
-- ponto de verdade: os dois lugares que podem disparar o convite (perfil
-- salvo no Grátis, ou primeira "Adaptar para vaga" nos planos pagos)
-- checam essa coluna antes de agir, então não importa qual dos dois
-- acontece primeiro pra um usuário — o segundo sempre vê a coluna já
-- preenchida e não repete.
alter table public.candidate_profiles
  add column if not exists whatsapp_invite_sent_at timestamptz;
