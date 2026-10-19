-- O novo formulário de /consultoria/recrutamento-e-selecao (lead B2B) pede
-- só nome, empresa, WhatsApp, cargo a contratar e urgência — sem e-mail, de
-- propósito, pra reduzir fricção num fluxo pensado pra fechar no WhatsApp.
-- `leads.email` era `not null`; vira opcional (null = lead sem e-mail
-- coletado) sem afetar os formulários que continuam coletando e-mail
-- (contato geral, produtos).
alter table public.leads alter column email drop not null;
