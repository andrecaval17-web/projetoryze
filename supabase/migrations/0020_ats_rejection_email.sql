-- E-mail automático de rejeição — pedido do cliente em 2026-07-30. Mesmo
-- padrão de idempotência de `candidate_profiles.whatsapp_invite_sent_at`
-- (ver `maybeSendWhatsappInvite`): marca permanente de "já foi enviado",
-- não uma comparação com o status anterior — se o admin mover a
-- candidatura pra fora de "rejeitado" e devolver pra "rejeitado" de novo
-- por engano, o e-mail não é reenviado.
alter table public.ats_applications
  add column rejection_email_sent_at timestamptz;
