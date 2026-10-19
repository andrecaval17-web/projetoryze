-- Expansão tier 2 do lote B2B: 1 capital por UF ainda sem representante em
-- `geo_cities` (norte, nordeste, centro-oeste e sul completos) + mais
-- algumas cidades de grande porte no sudeste/sul fora das capitais já
-- cadastradas. Mesmo padrão da 0023: slug sem acento, uf minúscula, region
-- no enum já existente, tier 2 (prioridade abaixo das capitais tier 1já
-- cadastradas em 0023).
--
-- Decisão explícita (igual registrada na 0023): não inclui São Paulo
-- capital nem Rio de Janeiro capital — ambas já foram removidas de
-- propósito em 0023 e continuam de fora aqui.
--
-- `on conflict (uf, slug) do nothing` porque a constraint única (uf, slug)
-- já existe desde a 0022 — o arquivo pode rodar mais de uma vez sem
-- duplicar linha.
insert into public.geo_cities (slug, uf, name, uf_name, region, tier) values
  ('rio-branco', 'ac', 'Rio Branco', 'Acre', 'norte', 2),
  ('macapa', 'ap', 'Macapá', 'Amapá', 'norte', 2),
  ('belem', 'pa', 'Belém', 'Pará', 'norte', 2),
  ('porto-velho', 'ro', 'Porto Velho', 'Rondônia', 'norte', 2),
  ('boa-vista', 'rr', 'Boa Vista', 'Roraima', 'norte', 2),
  ('palmas', 'to', 'Palmas', 'Tocantins', 'norte', 2),
  ('maceio', 'al', 'Maceió', 'Alagoas', 'nordeste', 2),
  ('fortaleza', 'ce', 'Fortaleza', 'Ceará', 'nordeste', 2),
  ('sao-luis', 'ma', 'São Luís', 'Maranhão', 'nordeste', 2),
  ('joao-pessoa', 'pb', 'João Pessoa', 'Paraíba', 'nordeste', 2),
  ('recife', 'pe', 'Recife', 'Pernambuco', 'nordeste', 2),
  ('teresina', 'pi', 'Teresina', 'Piauí', 'nordeste', 2),
  ('natal', 'rn', 'Natal', 'Rio Grande do Norte', 'nordeste', 2),
  ('aracaju', 'se', 'Aracaju', 'Sergipe', 'nordeste', 2),
  ('goiania', 'go', 'Goiânia', 'Goiás', 'centro-oeste', 2),
  ('cuiaba', 'mt', 'Cuiabá', 'Mato Grosso', 'centro-oeste', 2),
  ('campo-grande', 'ms', 'Campo Grande', 'Mato Grosso do Sul', 'centro-oeste', 2),
  ('porto-alegre', 'rs', 'Porto Alegre', 'Rio Grande do Sul', 'sul', 2),
  ('florianopolis', 'sc', 'Florianópolis', 'Santa Catarina', 'sul', 2),
  ('campinas', 'sp', 'Campinas', 'São Paulo', 'sudeste', 2),
  ('ribeirao-preto', 'sp', 'Ribeirão Preto', 'São Paulo', 'sudeste', 2),
  ('sorocaba', 'sp', 'Sorocaba', 'São Paulo', 'sudeste', 2),
  ('joinville', 'sc', 'Joinville', 'Santa Catarina', 'sul', 2),
  ('londrina', 'pr', 'Londrina', 'Paraná', 'sul', 2),
  ('uberlandia', 'mg', 'Uberlândia', 'Minas Gerais', 'sudeste', 2),
  ('juiz-de-fora', 'mg', 'Juiz de Fora', 'Minas Gerais', 'sudeste', 2),
  ('niteroi', 'rj', 'Niterói', 'Rio de Janeiro', 'sudeste', 2)
on conflict (uf, slug) do nothing;
