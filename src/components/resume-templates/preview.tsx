import { formatPeriod, type ResumeData, type ResumeTemplateSlug } from "@/lib/resume-schema";
import { cn } from "@/lib/utils";

// Os modelos de currículo simulam uma folha impressa — por isso usam cores
// literais (não os tokens de tema claro/escuro do site): um currículo em
// "modo escuro" não existe no mundo real, e teria que ficar legível também
// quando exportado em PDF (que é sempre "papel"). Mesma escala de
// espaçamento/hierarquia usada em pdf.tsx, pra o preview bater com o PDF
// baixado.
const PAPER = "#ffffff";
const INK = "#2e2c2a";
const INK_MUTED = "#6b6864";
const NEUTRAL_100 = "#ebe7df";
const NEUTRAL_200 = "#ddd7cc";
const ACCENT_500 = "#e85c2a";
const ACCENT_600 = "#a83e1d";
const ACCENT_TINT = "#fbf0ea";

function ContactLine({ data, className }: { data: ResumeData; className?: string }) {
  const parts = [data.contato.email, data.contato.telefone, data.contato.linkedin].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className={cn("break-words", className)}>{parts.join("   ·   ")}</p>;
}

function Paper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[720px] shadow-lg", className)}
      style={{ backgroundColor: PAPER, color: INK }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2
      className="text-[10.5px] font-bold uppercase tracking-[0.12em] pb-1 mb-2.5 border-b"
      style={{ color: ACCENT_600, borderColor: NEUTRAL_200, ...style }}
    >
      {children}
    </h2>
  );
}

function BasicoPreview({ data }: { data: ResumeData }) {
  return (
    <Paper className="px-10 py-9">
      <h1 className="text-[22px] font-bold tracking-tight" style={{ color: INK }}>
        {data.nome || "Seu nome"}
      </h1>
      {data.titulo && (
        <p className="mt-1 text-[13px] font-bold" style={{ color: ACCENT_600 }}>
          {data.titulo}
        </p>
      )}
      <ContactLine data={data} className="mt-2 text-[11px]" />
      <div className="mt-2 text-[11px]" style={{ color: INK_MUTED }} />

      {data.resumo && (
        <section className="mt-5">
          <SectionTitle>Resumo</SectionTitle>
          <p className="text-[12.5px] leading-relaxed">{data.resumo}</p>
        </section>
      )}

      {data.experiencias.length > 0 && (
        <section className="mt-5">
          <SectionTitle>Experiência</SectionTitle>
          <div className="flex flex-col gap-3.5">
            {data.experiencias.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-bold" style={{ color: INK }}>
                    {exp.cargo}
                  </p>
                  {formatPeriod(exp.periodo) && (
                    <p className="shrink-0 text-[11px] italic" style={{ color: INK_MUTED }}>
                      {formatPeriod(exp.periodo)}
                    </p>
                  )}
                </div>
                {exp.empresa && (
                  <p className="mt-0.5 mb-1 text-[11.5px]" style={{ color: INK_MUTED }}>
                    {exp.empresa}
                  </p>
                )}
                <p className="text-[12.5px] leading-relaxed">{exp.descricao}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.formacao.length > 0 && (
        <section className="mt-5">
          <SectionTitle>Formação</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {data.formacao.map((f, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[13px] font-bold" style={{ color: INK }}>
                    {f.curso}
                  </p>
                  {f.instituicao && (
                    <p className="text-[11.5px]" style={{ color: INK_MUTED }}>
                      {f.instituicao}
                    </p>
                  )}
                </div>
                {formatPeriod(f.periodo) && (
                  <p className="shrink-0 text-[11px] italic" style={{ color: INK_MUTED }}>
                    {formatPeriod(f.periodo)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.habilidades.length > 0 && (
        <section className="mt-5">
          <SectionTitle>Habilidades</SectionTitle>
          <p className="text-[12.5px] leading-loose">{data.habilidades.join("   •   ")}</p>
        </section>
      )}

      {data.idiomas.length > 0 && (
        <section className="mt-5">
          <SectionTitle>Idiomas</SectionTitle>
          <p className="text-[12.5px] leading-loose">{data.idiomas.join("   •   ")}</p>
        </section>
      )}
    </Paper>
  );
}

function SideSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-7 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: ACCENT_600 }}>
      {children}
    </h2>
  );
}

function ModernoPreview({ data }: { data: ResumeData }) {
  return (
    <Paper className="flex overflow-hidden">
      <div className="w-[36%] px-6 py-9" style={{ backgroundColor: NEUTRAL_100 }}>
        {/* 19px, não 22 como os outros modelos — a coluna lateral (36% da
            página) quebra nomes com palavra longa no meio da palavra em
            tamanhos maiores, confirmado num PDF de teste real. */}
        <h1 className="text-[19px] font-bold tracking-tight" style={{ color: INK }}>
          {data.nome || "Seu nome"}
        </h1>
        {data.titulo && (
          <p className="mt-1.5 text-[12px] font-bold" style={{ color: ACCENT_600 }}>
            {data.titulo}
          </p>
        )}

        <SideSectionTitle>Contato</SideSectionTitle>
        <div className="mt-2.5 flex flex-col gap-1.5 text-[10px] break-words" style={{ color: INK_MUTED }}>
          {data.contato.email && <span>{data.contato.email}</span>}
          {data.contato.telefone && <span>{data.contato.telefone}</span>}
          {data.contato.linkedin && <span>{data.contato.linkedin}</span>}
        </div>

        {data.habilidades.length > 0 && (
          <>
            <SideSectionTitle>Habilidades</SideSectionTitle>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-[10px]" style={{ color: INK }}>
              {data.habilidades.map((h, i) => (
                <li key={i}>• {h}</li>
              ))}
            </ul>
          </>
        )}

        {data.idiomas.length > 0 && (
          <>
            <SideSectionTitle>Idiomas</SideSectionTitle>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-[10px]" style={{ color: INK }}>
              {data.idiomas.map((h, i) => (
                <li key={i}>• {h}</li>
              ))}
            </ul>
          </>
        )}

        {data.formacao.length > 0 && (
          <>
            <SideSectionTitle>Formação</SideSectionTitle>
            <div className="mt-2.5 flex flex-col gap-3">
              {data.formacao.map((f, i) => (
                <div key={i} className="text-[10px]">
                  <p className="font-bold" style={{ color: INK }}>
                    {f.curso}
                  </p>
                  <p style={{ color: INK_MUTED }}>
                    {[f.instituicao, formatPeriod(f.periodo)].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="w-[64%] px-7 py-9">
        {data.resumo && (
          <section>
            <h2
              className="border-l-[3px] pl-2.5 text-[13px] font-bold uppercase tracking-wide"
              style={{ borderColor: ACCENT_500, color: ACCENT_600 }}
            >
              Resumo
            </h2>
            <p className="mt-3 text-[12px] leading-relaxed">{data.resumo}</p>
          </section>
        )}

        {data.experiencias.length > 0 && (
          <section className="mt-8">
            <h2
              className="border-l-[3px] pl-2.5 text-[13px] font-bold uppercase tracking-wide"
              style={{ borderColor: ACCENT_500, color: ACCENT_600 }}
            >
              Experiência
            </h2>
            <div className="mt-3 flex flex-col gap-5">
              {data.experiencias.map((exp, i) => (
                <div key={i}>
                  <p className="text-[12.5px] font-bold">{exp.cargo}</p>
                  <p className="mt-0.5 mb-1 text-[10.5px] italic" style={{ color: ACCENT_600 }}>
                    {[exp.empresa, formatPeriod(exp.periodo)].filter(Boolean).join("   ·   ")}
                  </p>
                  <p className="text-[12px] leading-relaxed">{exp.descricao}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Paper>
  );
}

// Redesenhado a partir de um currículo de referência real trazido pelo
// cliente + pesquisa de convenções de mercado pra currículo executivo:
// uma coluna só (sem sidebar — recomendação recorrente também pra leitura
// correta por ATS), cor de destaque só em títulos de seção e nome de
// empresa, linhas finas em vez de blocos de cor preenchidos.
function ExecutivoSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: ACCENT_600 }}>
        {children}
      </h2>
      <div className="mt-1 mb-3 h-px" style={{ backgroundColor: NEUTRAL_200 }} />
    </div>
  );
}

function ExecutivoPreview({ data }: { data: ResumeData }) {
  return (
    <Paper className="px-10 py-9">
      <h1 className="text-[19px] font-bold uppercase tracking-[0.06em]" style={{ color: INK }}>
        {data.nome || "Seu nome"}
      </h1>
      {data.titulo && (
        <p className="mt-1.5 text-[11px] italic" style={{ color: INK_MUTED }}>
          {data.titulo}
        </p>
      )}
      <ContactLine data={data} className="mt-1.5 text-[10.5px]" />
      <div className="mt-3.5 h-[1.2px]" style={{ backgroundColor: ACCENT_600 }} />

      {data.resumo && (
        <section>
          <ExecutivoSectionTitle>Resumo profissional</ExecutivoSectionTitle>
          <p className="text-[12px] leading-relaxed">{data.resumo}</p>
        </section>
      )}

      {data.experiencias.length > 0 && (
        <section>
          <ExecutivoSectionTitle>Experiência profissional</ExecutivoSectionTitle>
          <div className="flex flex-col gap-4">
            {data.experiencias.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[12.5px] font-bold">
                    {exp.cargo}
                    {exp.empresa && (
                      <span style={{ color: ACCENT_600 }}> — {exp.empresa}</span>
                    )}
                  </p>
                  {formatPeriod(exp.periodo) && (
                    <p className="shrink-0 text-[10.5px] italic" style={{ color: INK_MUTED }}>
                      {formatPeriod(exp.periodo)}
                    </p>
                  )}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed">{exp.descricao}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.formacao.length > 0 && (
        <section>
          <ExecutivoSectionTitle>Formação acadêmica</ExecutivoSectionTitle>
          <div className="flex flex-col gap-1.5">
            {data.formacao.map((f, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[11.5px] font-bold" style={{ color: INK }}>
                    {f.curso}
                  </p>
                  {f.instituicao && (
                    <p className="text-[10.5px]" style={{ color: INK_MUTED }}>
                      {f.instituicao}
                    </p>
                  )}
                </div>
                {formatPeriod(f.periodo) && (
                  <p className="shrink-0 text-[10.5px] italic" style={{ color: INK_MUTED }}>
                    {formatPeriod(f.periodo)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.habilidades.length > 0 && (
        <section>
          <ExecutivoSectionTitle>Competências</ExecutivoSectionTitle>
          <p className="text-[11.5px] leading-loose">{data.habilidades.join("  ·  ")}</p>
        </section>
      )}

      {data.idiomas.length > 0 && (
        <section>
          <ExecutivoSectionTitle>Idiomas</ExecutivoSectionTitle>
          <p className="text-[11.5px] leading-loose">{data.idiomas.join("  ·  ")}</p>
        </section>
      )}
    </Paper>
  );
}

function CriativoPreview({ data }: { data: ResumeData }) {
  return (
    <Paper>
      <div className="px-8 py-7" style={{ backgroundColor: ACCENT_500 }}>
        <h1 className="text-[23px] font-bold tracking-tight text-white">{data.nome || "Seu nome"}</h1>
        {data.titulo && <p className="mt-1.5 text-[13px] font-bold text-white/95">{data.titulo}</p>}
        <ContactLine data={data} className="mt-3 text-[10.5px] text-white/90" />
      </div>

      <div className="flex">
        <div className="w-[63%] px-7 py-7">
          {data.resumo && (
            <section>
              <span
                className="inline-block rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: ACCENT_600 }}
              >
                Sobre
              </span>
              <p className="mt-3 text-[12px] leading-relaxed">{data.resumo}</p>
            </section>
          )}

          {data.experiencias.length > 0 && (
            <section className="mt-8">
              <span
                className="inline-block rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: ACCENT_600 }}
              >
                Experiência
              </span>
              <div className="mt-3 flex flex-col gap-5">
                {data.experiencias.map((exp, i) => (
                  <div key={i}>
                    <p className="text-[12.5px] font-bold">{exp.cargo}</p>
                    {formatPeriod(exp.periodo) && (
                      <p className="mt-0.5 mb-1 text-[10.5px] font-bold" style={{ color: ACCENT_600 }}>
                        {[exp.empresa, formatPeriod(exp.periodo)].filter(Boolean).join("   ·   ")}
                      </p>
                    )}
                    <p className="text-[12px] leading-relaxed">{exp.descricao}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="w-[37%] px-6 py-7" style={{ backgroundColor: ACCENT_TINT }}>
          {data.formacao.length > 0 && (
            <section>
              <span
                className="inline-block rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: ACCENT_600 }}
              >
                Formação
              </span>
              <div className="mt-3 flex flex-col gap-3.5">
                {data.formacao.map((f, i) => (
                  <div key={i} className="text-[10px]">
                    <p className="font-bold" style={{ color: INK }}>
                      {f.curso}
                    </p>
                    <p className="mt-0.5" style={{ color: INK_MUTED }}>
                      {[f.instituicao, formatPeriod(f.periodo)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.habilidades.length > 0 && (
            <section className="mt-7">
              <span
                className="inline-block rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: ACCENT_600 }}
              >
                Habilidades
              </span>
              <p className="mt-2.5 text-[10.5px] leading-loose">{data.habilidades.join(" · ")}</p>
            </section>
          )}

          {data.idiomas.length > 0 && (
            <section className="mt-7">
              <span
                className="inline-block rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: ACCENT_600 }}
              >
                Idiomas
              </span>
              <p className="mt-2.5 text-[10.5px] leading-loose">{data.idiomas.join(" · ")}</p>
            </section>
          )}
        </div>
      </div>
    </Paper>
  );
}

function EleganteSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-[13px] font-bold tracking-[0.2em]" style={{ color: ACCENT_600 }}>
        {children}
      </h2>
      <div className="mt-1.5 h-[1.5px] w-6" style={{ backgroundColor: ACCENT_500 }} />
    </div>
  );
}

function ElegantePreview({ data }: { data: ResumeData }) {
  return (
    <Paper className="px-10 py-9">
      <h1 className="text-[24px] font-bold tracking-wide" style={{ color: INK }}>
        {data.nome || "Seu nome"}
      </h1>
      {data.titulo && (
        <p className="mt-1.5 text-[13px] font-bold" style={{ color: ACCENT_600 }}>
          {data.titulo}
        </p>
      )}
      <ContactLine data={data} className="mt-2.5 text-[11px]" />
      <div className="mt-4 h-[1.2px]" style={{ backgroundColor: ACCENT_500 }} />

      <div className="mt-7 flex gap-8">
        <div className="w-[61%]">
          {data.resumo && (
            <section>
              <EleganteSectionTitle>Resumo</EleganteSectionTitle>
              <p className="mt-3 text-[12px] leading-relaxed">{data.resumo}</p>
            </section>
          )}

          {data.experiencias.length > 0 && (
            <section>
              <EleganteSectionTitle>Experiência</EleganteSectionTitle>
              <div className="mt-3 flex flex-col gap-5">
                {data.experiencias.map((exp, i) => (
                  <div key={i}>
                    <p className="text-[12.5px] font-bold">{exp.cargo}</p>
                    {formatPeriod(exp.periodo) && (
                      <p className="mt-0.5 mb-1 text-[10.5px] italic" style={{ color: INK_MUTED }}>
                        {[exp.empresa, formatPeriod(exp.periodo)].filter(Boolean).join("   ·   ")}
                      </p>
                    )}
                    <p className="text-[12px] leading-relaxed">{exp.descricao}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="w-[39%] border-l pl-6" style={{ borderColor: NEUTRAL_200 }}>
          {data.formacao.length > 0 && (
            <section>
              <EleganteSectionTitle>Formação</EleganteSectionTitle>
              <div className="mt-3 flex flex-col gap-3.5">
                {data.formacao.map((f, i) => (
                  <div key={i} className="text-[10px]">
                    <p className="font-bold" style={{ color: INK }}>
                      {f.curso}
                    </p>
                    <p className="mt-0.5" style={{ color: INK_MUTED }}>
                      {[f.instituicao, formatPeriod(f.periodo)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.habilidades.length > 0 && (
            <section>
              <EleganteSectionTitle>Habilidades</EleganteSectionTitle>
              <p className="mt-2.5 text-[10.5px] leading-loose">{data.habilidades.join(" · ")}</p>
            </section>
          )}

          {data.idiomas.length > 0 && (
            <section>
              <EleganteSectionTitle>Idiomas</EleganteSectionTitle>
              <p className="mt-2.5 text-[10.5px] leading-loose">{data.idiomas.join(" · ")}</p>
            </section>
          )}
        </div>
      </div>
    </Paper>
  );
}

export const RESUME_PREVIEW_COMPONENTS: Record<
  ResumeTemplateSlug,
  (props: { data: ResumeData }) => React.ReactElement
> = {
  basico: BasicoPreview,
  moderno: ModernoPreview,
  executivo: ExecutivoPreview,
  criativo: CriativoPreview,
  elegante: ElegantePreview,
};
