import { GEO_PAGE_TYPES } from "./page-types";

const GEO_ORIGIN_PATTERN = new RegExp(
  `^/(${GEO_PAGE_TYPES.map((t) => t.slug).join("|")})/[a-z]{2}/[a-z0-9-]+$`
);

/**
 * Valida o parâmetro `origem` que as páginas geo (/[tipo]/[uf]/[cidade])
 * anexam ao link pro /contato — mesma cautela do `produto`/`intencao`
 * existentes (nunca refletir texto arbitrário da query string sem checar
 * contra os valores que a própria Ryze gera). Não confirma que a cidade
 * existe em `geo_cities` (evitaria uma query extra num caminho de leitura
 * pública só pra validar um campo informativo) — só a forma do path.
 */
export function isValidGeoOrigin(origem: string | undefined): origem is string {
  return typeof origem === "string" && GEO_ORIGIN_PATTERN.test(origem);
}
