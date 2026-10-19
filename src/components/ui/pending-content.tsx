/**
 * Marca um trecho de conteúdo que ainda falta receber do cliente (ex: regra
 * de garantia, modelo de cobrança) — nunca inventado aqui. Renderizado só
 * em desenvolvimento (`next dev`), pra quem está revisando a página antes
 * de publicar enxergar claramente o que falta; em produção retorna `null`
 * no próprio servidor, então a frase nunca chega a ser enviada no HTML.
 */
export function PendingContent({ note }: { note: string }) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <span
      role="note"
      className="ml-2 inline-flex items-center gap-1 rounded-md border border-dashed border-amber-500 bg-amber-500/10 px-2 py-0.5 text-caption font-medium text-amber-700 dark:border-amber-400 dark:text-amber-400"
    >
      ⚠ PENDENTE: {note}
    </span>
  );
}
