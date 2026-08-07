import { getSupabasePublicClient } from "@/lib/supabase/public";

export type GeoRegion = "norte" | "nordeste" | "centro-oeste" | "sudeste" | "sul";

export interface GeoCity {
  slug: string;
  /** Sigla minúscula (ex: "es") — é assim que aparece na URL. */
  uf: string;
  name: string;
  ufName: string;
  region: GeoRegion;
  tier: 1 | 2 | 3;
}

interface GeoCityRow {
  slug: string;
  uf: string;
  name: string;
  uf_name: string;
  region: GeoRegion;
  tier: number;
}

function mapRow(row: GeoCityRow): GeoCity {
  return {
    slug: row.slug,
    uf: row.uf,
    name: row.name,
    ufName: row.uf_name,
    region: row.region,
    tier: (row.tier as 1 | 2 | 3) ?? 3,
  };
}

const CITY_COLUMNS = "slug, uf, name, uf_name, region, tier";

/** Busca uma cidade ativa por UF + slug — usado por generateMetadata e pela própria página. */
export async function getGeoCity(uf: string, slug: string): Promise<GeoCity | null> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("geo_cities")
    .select(CITY_COLUMNS)
    .eq("uf", uf.toLowerCase())
    .eq("slug", slug.toLowerCase())
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[geo] falha ao buscar cidade", error);
    return null;
  }

  return data ? mapRow(data as GeoCityRow) : null;
}

/** Todas as cidades ativas — usado pra montar a malha de links internos e o generateStaticParams do lote completo (Fase 2). */
export async function listGeoCities(): Promise<GeoCity[]> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("geo_cities")
    .select(CITY_COLUMNS)
    .eq("is_active", true)
    .order("tier", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[geo] falha ao listar cidades", error);
    return [];
  }

  return (data as GeoCityRow[]).map(mapRow);
}
