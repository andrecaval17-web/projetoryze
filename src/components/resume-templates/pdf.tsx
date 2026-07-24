import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { breakableText, formatPeriod, type ResumeData, type ResumeTemplateSlug } from "@/lib/resume-schema";

// Cores literais (react-pdf não lê variáveis CSS/Tailwind) — mesmos valores
// de src/app/globals.css.
const INK = "#2e2c2a";
const INK_MUTED = "#6b6864";
const NEUTRAL_100 = "#ebe7df";
const NEUTRAL_200 = "#ddd7cc";
const ACCENT_500 = "#e85c2a";
const ACCENT_600 = "#a83e1d";
const ACCENT_TINT = "#fbf0ea";

function ContactLine({ data }: { data: ResumeData }) {
  const parts = [data.contato.email, data.contato.telefone, data.contato.linkedin]
    .filter(Boolean)
    .map(breakableText);
  if (parts.length === 0) return null;
  return <Text>{parts.join("   ·   ")}</Text>;
}

// ---------- Básico (Grátis) — uma coluna, tradicional, sem cor ----------
// Escala de espaçamento/hierarquia reaproveitada (com ajustes) pelos 3
// modelos pagos, pra manter os 4 currículos consistentes entre si.
const basicoStyles = StyleSheet.create({
  page: { paddingVertical: 36, paddingHorizontal: 42, fontSize: 9.5, color: INK, fontFamily: "Helvetica" },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 3, letterSpacing: 0.3 },
  title: { fontSize: 12, color: ACCENT_600, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  contact: { fontSize: 9, color: INK_MUTED, marginBottom: 16 },
  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: ACCENT_600,
    borderBottom: `1.2pt solid ${NEUTRAL_200}`,
    paddingBottom: 4,
    marginBottom: 10,
  },
  item: { marginBottom: 11 },
  itemHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: INK },
  itemMeta: { fontSize: 9, color: INK_MUTED, fontFamily: "Helvetica-Oblique" },
  itemSubtitle: { fontSize: 9, color: INK_MUTED, marginTop: 1, marginBottom: 4 },
  itemBody: { fontSize: 9.5, lineHeight: 1.5, color: INK },
  skills: { fontSize: 9.5, lineHeight: 1.7 },
});

function BasicoPdf({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={basicoStyles.page}>
        <Text style={basicoStyles.name}>{data.nome || "Seu nome"}</Text>
        {data.titulo ? <Text style={basicoStyles.title}>{data.titulo}</Text> : null}
        <View style={basicoStyles.contact}>
          <ContactLine data={data} />
        </View>

        {data.resumo ? (
          <View style={basicoStyles.section}>
            <Text style={basicoStyles.sectionTitle} minPresenceAhead={40}>
              Resumo
            </Text>
            <Text style={basicoStyles.itemBody}>{data.resumo}</Text>
          </View>
        ) : null}

        {data.experiencias.length > 0 ? (
          <View style={basicoStyles.section}>
            <Text style={basicoStyles.sectionTitle} minPresenceAhead={50}>
              Experiência
            </Text>
            {data.experiencias.map((exp, i) => (
              <View key={i} style={basicoStyles.item} wrap={false}>
                <View style={basicoStyles.itemHeadRow}>
                  <Text style={basicoStyles.itemTitle}>{exp.cargo}</Text>
                  {formatPeriod(exp.periodo) ? (
                    <Text style={basicoStyles.itemMeta}>{formatPeriod(exp.periodo)}</Text>
                  ) : null}
                </View>
                {exp.empresa ? <Text style={basicoStyles.itemSubtitle}>{exp.empresa}</Text> : null}
                <Text style={basicoStyles.itemBody}>{exp.descricao}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.formacao.length > 0 ? (
          <View style={basicoStyles.section}>
            <Text style={basicoStyles.sectionTitle} minPresenceAhead={45}>
              Formação
            </Text>
            {data.formacao.map((f, i) => (
              <View key={i} style={basicoStyles.item} wrap={false}>
                <View style={basicoStyles.itemHeadRow}>
                  <Text style={basicoStyles.itemTitle}>{f.curso}</Text>
                  {formatPeriod(f.periodo) ? (
                    <Text style={basicoStyles.itemMeta}>{formatPeriod(f.periodo)}</Text>
                  ) : null}
                </View>
                {f.instituicao ? <Text style={basicoStyles.itemSubtitle}>{f.instituicao}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.habilidades.length > 0 ? (
          <View style={basicoStyles.section} wrap={false}>
            <Text style={basicoStyles.sectionTitle}>Habilidades</Text>
            <Text style={basicoStyles.skills}>{data.habilidades.join("   •   ")}</Text>
          </View>
        ) : null}

        {data.idiomas.length > 0 ? (
          <View style={basicoStyles.section} wrap={false}>
            <Text style={basicoStyles.sectionTitle}>Idiomas</Text>
            <Text style={basicoStyles.skills}>{data.idiomas.join("   •   ")}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

// ---------- Moderno (pago) — coluna lateral com contato/habilidades ----------
const modernoStyles = StyleSheet.create({
  // `alignItems: "flex-start"` é essencial aqui — sem isso, o Yoga (motor de
  // layout do react-pdf) usa o default de flexbox (`stretch`) e, quando o
  // conteúdo da coluna principal continua numa página seguinte mas a lateral
  // já terminou o dela, a lateral (vazia) ainda estica pra altura da página
  // inteira, mostrando um retângulo colorido vazio. Com `flex-start`, cada
  // coluna só ocupa a altura do que realmente tem pra mostrar naquela página.
  // `paddingVertical` mora na página (não nos filhos) porque react-pdf só
  // reaplica o padding de um View fragmentado por quebra de página na
  // primeira página do fragmento — a partir da segunda, esse padding some e
  // o conteúdo cola na borda superior (bug conhecido do react-pdf com
  // `flexDirection: "row"` cruzando páginas). Padding da própria `Page` é
  // reaplicado de verdade em toda página física.
  page: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 34,
    fontSize: 9.5,
    color: INK,
    fontFamily: "Helvetica",
  },
  // `marginVertical: -34` cancela o padding acima especificamente pra
  // sidebar, cujo fundo colorido precisa continuar sangrando até a borda
  // real da página (senão sobraria uma faixa da cor do papel acima/abaixo
  // da cor da sidebar) — o padding interno do texto continua vindo do
  // `paddingVertical: 34` próprio dela, como antes.
  sidebar: {
    width: "36%",
    backgroundColor: NEUTRAL_100,
    marginVertical: -34,
    paddingVertical: 34,
    paddingHorizontal: 24,
  },
  main: { width: "64%", paddingHorizontal: 28 },
  // Fica menor que o nome dos outros modelos de propósito: a coluna lateral
  // tem só 36% da largura da página — em 22px, nomes com uma palavra mais
  // longa (ex: sobrenomes compostos) quebravam no meio da palavra
  // ("Camila An-\ndrade Ferreira"), confirmado num PDF de teste real.
  name: { fontSize: 19, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 4, letterSpacing: 0.1 },
  title: { fontSize: 12, color: ACCENT_600, marginBottom: 22, fontFamily: "Helvetica-Bold" },
  sideSectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: ACCENT_600,
    marginTop: 24,
    marginBottom: 10,
  },
  sideText: { fontSize: 8.5, color: INK_MUTED, marginBottom: 4.5, lineHeight: 1.5 },
  skillItem: { marginBottom: 5.5, wrap: false },
  skillPill: { fontSize: 8.5, color: INK },
  eduItem: { marginBottom: 10 },
  eduTitle: { fontSize: 8.5, color: INK, fontFamily: "Helvetica-Bold", marginBottom: 1.5 },
  eduSub: { fontSize: 8, color: INK_MUTED },
  mainSectionTitle: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: ACCENT_600,
    marginBottom: 12,
    marginTop: 24,
    borderLeft: `3pt solid ${ACCENT_500}`,
    paddingLeft: 10,
  },
  item: { marginBottom: 14 },
  itemTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: INK },
  itemSubtitle: { fontSize: 8.5, color: ACCENT_600, marginTop: 1.5, marginBottom: 5, fontFamily: "Helvetica-Oblique" },
  itemBody: { fontSize: 9.5, lineHeight: 1.55 },
});

function ModernoPdf({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={modernoStyles.page}>
        <View style={modernoStyles.sidebar}>
          <Text style={modernoStyles.name}>{data.nome || "Seu nome"}</Text>
          {data.titulo ? <Text style={modernoStyles.title}>{data.titulo}</Text> : null}

          <Text style={modernoStyles.sideSectionTitle} minPresenceAhead={25}>
            Contato
          </Text>
          {data.contato.email ? (
            <Text style={modernoStyles.sideText}>{breakableText(data.contato.email)}</Text>
          ) : null}
          {data.contato.telefone ? (
            <Text style={modernoStyles.sideText}>{data.contato.telefone}</Text>
          ) : null}
          {data.contato.linkedin ? (
            <Text style={modernoStyles.sideText}>{breakableText(data.contato.linkedin)}</Text>
          ) : null}

          {data.habilidades.length > 0 ? (
            <>
              <Text style={modernoStyles.sideSectionTitle} minPresenceAhead={30}>
                Habilidades
              </Text>
              {data.habilidades.map((h, i) => (
                <View key={i} style={modernoStyles.skillItem} wrap={false}>
                  <Text style={modernoStyles.skillPill}>• {h}</Text>
                </View>
              ))}
            </>
          ) : null}

          {data.idiomas.length > 0 ? (
            <>
              <Text style={modernoStyles.sideSectionTitle} minPresenceAhead={30}>
                Idiomas
              </Text>
              {data.idiomas.map((h, i) => (
                <View key={i} style={modernoStyles.skillItem} wrap={false}>
                  <Text style={modernoStyles.skillPill}>• {h}</Text>
                </View>
              ))}
            </>
          ) : null}

          {data.formacao.length > 0 ? (
            <>
              <Text style={modernoStyles.sideSectionTitle} minPresenceAhead={35}>
                Formação
              </Text>
              {data.formacao.map((f, i) => (
                <View key={i} style={modernoStyles.eduItem} wrap={false}>
                  <Text style={modernoStyles.eduTitle}>{f.curso}</Text>
                  <Text style={modernoStyles.eduSub}>
                    {[f.instituicao, formatPeriod(f.periodo)].filter(Boolean).join(" · ")}
                  </Text>
                </View>
              ))}
            </>
          ) : null}
        </View>

        <View style={modernoStyles.main}>
          {data.resumo ? (
            <View wrap={false}>
              <Text style={modernoStyles.mainSectionTitle}>Resumo</Text>
              <Text style={modernoStyles.itemBody}>{data.resumo}</Text>
            </View>
          ) : null}

          {data.experiencias.length > 0 ? (
            <View>
              <Text style={modernoStyles.mainSectionTitle} minPresenceAhead={55}>
                Experiência
              </Text>
              {data.experiencias.map((exp, i) => (
                <View key={i} style={modernoStyles.item} wrap={false}>
                  <Text style={modernoStyles.itemTitle}>{exp.cargo}</Text>
                  <Text style={modernoStyles.itemSubtitle}>
                    {[exp.empresa, formatPeriod(exp.periodo)].filter(Boolean).join("   ·   ")}
                  </Text>
                  <Text style={modernoStyles.itemBody}>{exp.descricao}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

// ---------- Executivo (pago) — uma coluna, densa, cor de destaque comedida ----------
// Redesenhado a partir de um currículo de referência real trazido pelo
// cliente (executivo sênior, doutorado, 14 anos de carreira) + pesquisa de
// convenções de mercado: currículo "profissional/executivo" não usa bloco
// de cor nem coluna lateral — usa UMA coluna, hierarquia por peso/tamanho
// de fonte, cor de destaque só em títulos de seção e nos nomes de empresa
// (nunca em fundo), e linhas finas em vez de blocos preenchidos. Sidebars
// também são desaconselhados por leitores de ATS (Applicant Tracking
// System) — currículo em coluna única lê na ordem certa, sem risco de
// texto da lateral se misturar com o da coluna principal na extração.
const executivoStyles = StyleSheet.create({
  page: { fontSize: 9.5, color: INK, fontFamily: "Helvetica", paddingVertical: 42, paddingHorizontal: 48 },
  name: { fontSize: 19, fontFamily: "Helvetica-Bold", letterSpacing: 1.2, marginBottom: 5 },
  title: { fontSize: 10, color: INK_MUTED, fontFamily: "Helvetica-Oblique", marginBottom: 7 },
  contact: { fontSize: 8.5, color: INK_MUTED },
  headerRule: { marginTop: 14, height: 1.2, backgroundColor: ACCENT_600 },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT_600,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    marginTop: 20,
    marginBottom: 9,
  },
  sectionRule: { height: 0.7, backgroundColor: NEUTRAL_200, marginBottom: 10, marginTop: -3 },
  itemBody: { fontSize: 9.5, lineHeight: 1.55 },
  item: { marginBottom: 13 },
  itemHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemTitleRow: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  itemCompany: { color: ACCENT_600, fontFamily: "Helvetica-Bold" },
  itemMeta: { fontSize: 8.5, color: INK_MUTED, fontFamily: "Helvetica-Oblique" },
  itemSubtitle: { fontSize: 8.5, color: INK_MUTED, fontFamily: "Helvetica-Oblique", marginTop: 1.5, marginBottom: 4 },
  eduRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  eduTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  eduSub: { fontSize: 8.5, color: INK_MUTED },
  eduMeta: { fontSize: 8.5, color: INK_MUTED, fontFamily: "Helvetica-Oblique" },
  tagText: { fontSize: 9.5, lineHeight: 1.7 },
});

function ExecutivoPdf({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={executivoStyles.page}>
        <Text style={executivoStyles.name}>{(data.nome || "Seu nome").toUpperCase()}</Text>
        {data.titulo ? <Text style={executivoStyles.title}>{data.titulo}</Text> : null}
        <View style={executivoStyles.contact}>
          <ContactLine data={data} />
        </View>
        <View style={executivoStyles.headerRule} />

        {data.resumo ? (
          <View wrap={false}>
            <Text style={executivoStyles.sectionTitle}>Resumo profissional</Text>
            <View style={executivoStyles.sectionRule} />
            <Text style={executivoStyles.itemBody}>{data.resumo}</Text>
          </View>
        ) : null}

        {data.experiencias.length > 0 ? (
          <View>
            <Text style={executivoStyles.sectionTitle} minPresenceAhead={55}>
              Experiência profissional
            </Text>
            <View style={executivoStyles.sectionRule} />
            {data.experiencias.map((exp, i) => (
              <View key={i} style={executivoStyles.item} wrap={false}>
                <View style={executivoStyles.itemHeadRow}>
                  <Text style={executivoStyles.itemTitleRow}>
                    {exp.cargo}
                    {exp.empresa ? <Text style={executivoStyles.itemCompany}> — {exp.empresa}</Text> : null}
                  </Text>
                  {formatPeriod(exp.periodo) ? (
                    <Text style={executivoStyles.itemMeta}>{formatPeriod(exp.periodo)}</Text>
                  ) : null}
                </View>
                <Text style={executivoStyles.itemBody}>{exp.descricao}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.formacao.length > 0 ? (
          <View wrap={false}>
            <Text style={executivoStyles.sectionTitle} minPresenceAhead={35}>
              Formação acadêmica
            </Text>
            <View style={executivoStyles.sectionRule} />
            {data.formacao.map((f, i) => (
              <View key={i} style={executivoStyles.eduRow}>
                <View>
                  <Text style={executivoStyles.eduTitle}>{f.curso}</Text>
                  {f.instituicao ? <Text style={executivoStyles.eduSub}>{f.instituicao}</Text> : null}
                </View>
                {formatPeriod(f.periodo) ? (
                  <Text style={executivoStyles.eduMeta}>{formatPeriod(f.periodo)}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.habilidades.length > 0 ? (
          <View wrap={false}>
            <Text style={executivoStyles.sectionTitle}>Competências</Text>
            <View style={executivoStyles.sectionRule} />
            <Text style={executivoStyles.tagText}>{data.habilidades.join("  ·  ")}</Text>
          </View>
        ) : null}

        {data.idiomas.length > 0 ? (
          <View wrap={false}>
            <Text style={executivoStyles.sectionTitle}>Idiomas</Text>
            <View style={executivoStyles.sectionRule} />
            <Text style={executivoStyles.tagText}>{data.idiomas.join("  ·  ")}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

// ---------- Criativo (pago) — faixa de destaque colorida + corpo em duas colunas ----------
const criativoStyles = StyleSheet.create({
  // `paddingVertical` aqui cobre as páginas de continuação — mesmo motivo
  // documentado em executivoStyles.page (react-pdf não reaplica o padding
  // próprio de `main`/`side` a partir da 2ª página de um `flexDirection:
  // "row"` fragmentado). Na página 1, o `marginTop` negativo do `banner`
  // absorve esse padding antes que chegue em `body`, então `main`/`side`
  // continuam com o próprio `paddingVertical` de sempre pra manter o espaço
  // em relação ao banner.
  page: { fontSize: 9.5, color: INK, fontFamily: "Helvetica", paddingVertical: 24 },
  banner: { backgroundColor: ACCENT_500, marginTop: -24, paddingVertical: 28, paddingHorizontal: 32 },
  name: { fontSize: 23, fontFamily: "Helvetica-Bold", color: "#ffffff", letterSpacing: 0.2 },
  title: { fontSize: 12, color: "#ffffff", marginTop: 4, opacity: 0.95, fontFamily: "Helvetica-Bold" },
  contact: { fontSize: 8.5, color: "#ffffff", marginTop: 10, opacity: 0.95 },
  // `alignItems: "flex-start"` — ver comentário equivalente em modernoStyles.page.
  body: { flexDirection: "row", alignItems: "flex-start" },
  main: { width: "63%", paddingVertical: 26, paddingHorizontal: 30 },
  side: { width: "37%", paddingVertical: 26, paddingHorizontal: 26, backgroundColor: ACCENT_TINT },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    backgroundColor: ACCENT_600,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 2,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 11,
  },
  item: { marginBottom: 14 },
  itemTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  itemSubtitle: { fontSize: 8.5, color: ACCENT_600, marginTop: 1.5, marginBottom: 5, fontFamily: "Helvetica-Bold" },
  itemBody: { fontSize: 9.5, lineHeight: 1.55 },
  eduItem: { marginBottom: 10 },
  eduTitle: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  eduSub: { fontSize: 8, color: INK_MUTED, marginTop: 1.5 },
  skillItem: { fontSize: 8.5, lineHeight: 1.75, marginBottom: 3 },
});

function CriativoPdf({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={criativoStyles.page}>
        <View style={criativoStyles.banner}>
          <Text style={criativoStyles.name}>{data.nome || "Seu nome"}</Text>
          {data.titulo ? <Text style={criativoStyles.title}>{data.titulo}</Text> : null}
          <View style={criativoStyles.contact}>
            <ContactLine data={data} />
          </View>
        </View>

        <View style={criativoStyles.body}>
          <View style={criativoStyles.main}>
            {data.resumo ? (
              <View wrap={false}>
                <Text style={criativoStyles.sectionLabel}>Sobre</Text>
                <Text style={criativoStyles.itemBody}>{data.resumo}</Text>
              </View>
            ) : null}

            {data.experiencias.length > 0 ? (
              <View>
                <Text style={criativoStyles.sectionLabel} minPresenceAhead={55}>
                  Experiência
                </Text>
                {data.experiencias.map((exp, i) => (
                  <View key={i} style={criativoStyles.item} wrap={false}>
                    <Text style={criativoStyles.itemTitle}>{exp.cargo}</Text>
                    <Text style={criativoStyles.itemSubtitle}>
                      {[exp.empresa, formatPeriod(exp.periodo)].filter(Boolean).join("   ·   ")}
                    </Text>
                    <Text style={criativoStyles.itemBody}>{exp.descricao}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={criativoStyles.side}>
            {data.formacao.length > 0 ? (
              <View>
                <Text style={criativoStyles.sectionLabel} minPresenceAhead={35}>
                  Formação
                </Text>
                {data.formacao.map((f, i) => (
                  <View key={i} style={criativoStyles.eduItem} wrap={false}>
                    <Text style={criativoStyles.eduTitle}>{f.curso}</Text>
                    <Text style={criativoStyles.eduSub}>
                      {[f.instituicao, formatPeriod(f.periodo)].filter(Boolean).join(" · ")}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {data.habilidades.length > 0 ? (
              <View wrap={false}>
                <Text style={criativoStyles.sectionLabel}>Habilidades</Text>
                {data.habilidades.map((h, i) => (
                  <Text key={i} style={criativoStyles.skillItem}>
                    {h}
                  </Text>
                ))}
              </View>
            ) : null}

            {data.idiomas.length > 0 ? (
              <View wrap={false}>
                <Text style={criativoStyles.sectionLabel}>Idiomas</Text>
                {data.idiomas.map((h, i) => (
                  <Text key={i} style={criativoStyles.skillItem}>
                    {h}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ---------- Elegante (pago) — sidebar à direita, traços finos em vez de blocos ----------
const eleganteStyles = StyleSheet.create({
  // Sem `main`/`side` cruzando página com fundo colorido aqui (diferente de
  // moderno/executivo/criativo) — não precisa do truque de `marginTop`
  // negativo pra sangrar cor. `paddingVertical` continua na página, mesmo
  // motivo dos outros dois modelos de 2 colunas: garante a margem certa nas
  // páginas de continuação, onde react-pdf não reaplica o padding de um
  // View fragmentado por `flexDirection: "row"`.
  page: { fontSize: 9.5, color: INK, fontFamily: "Helvetica", paddingVertical: 38, paddingHorizontal: 40 },
  name: { fontSize: 24, fontFamily: "Helvetica-Bold", color: INK, letterSpacing: 0.4, marginBottom: 5 },
  title: { fontSize: 12, color: ACCENT_600, fontFamily: "Helvetica-Bold", marginBottom: 10 },
  contact: { fontSize: 8.5, color: INK_MUTED },
  rule: { marginTop: 18, height: 1.2, backgroundColor: ACCENT_500 },
  // `alignItems: "flex-start"` — ver comentário equivalente em modernoStyles.page.
  body: { flexDirection: "row", alignItems: "flex-start", marginTop: 26 },
  main: { width: "61%", paddingRight: 28 },
  side: { width: "39%", paddingLeft: 26, borderLeft: `1pt solid ${NEUTRAL_200}` },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT_600,
    letterSpacing: 2,
    marginBottom: 6,
    marginTop: 24,
  },
  sectionRule: { width: 22, height: 1.5, backgroundColor: ACCENT_500, marginBottom: 12 },
  item: { marginBottom: 14 },
  itemTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: INK },
  itemSubtitle: { fontSize: 8.5, color: INK_MUTED, marginTop: 1.5, marginBottom: 5, fontFamily: "Helvetica-Oblique" },
  itemBody: { fontSize: 9.5, lineHeight: 1.55 },
  eduItem: { marginBottom: 10 },
  eduTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: INK },
  eduSub: { fontSize: 8, color: INK_MUTED, marginTop: 1.5 },
  skillItem: { fontSize: 8.5, lineHeight: 1.75, marginBottom: 3, color: INK },
});

function EleganteSectionTitle({ children, minPresenceAhead }: { children: string; minPresenceAhead?: number }) {
  return (
    <View>
      <Text style={eleganteStyles.sectionTitle} minPresenceAhead={minPresenceAhead}>
        {children}
      </Text>
      <View style={eleganteStyles.sectionRule} />
    </View>
  );
}

function ElegantePdf({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={eleganteStyles.page}>
        <Text style={eleganteStyles.name}>{data.nome || "Seu nome"}</Text>
        {data.titulo ? <Text style={eleganteStyles.title}>{data.titulo}</Text> : null}
        <View style={eleganteStyles.contact}>
          <ContactLine data={data} />
        </View>
        <View style={eleganteStyles.rule} />

        <View style={eleganteStyles.body}>
          <View style={eleganteStyles.main}>
            {data.resumo ? (
              <View wrap={false}>
                <EleganteSectionTitle>Resumo</EleganteSectionTitle>
                <Text style={eleganteStyles.itemBody}>{data.resumo}</Text>
              </View>
            ) : null}

            {data.experiencias.length > 0 ? (
              <View>
                <EleganteSectionTitle minPresenceAhead={55}>Experiência</EleganteSectionTitle>
                {data.experiencias.map((exp, i) => (
                  <View key={i} style={eleganteStyles.item} wrap={false}>
                    <Text style={eleganteStyles.itemTitle}>{exp.cargo}</Text>
                    <Text style={eleganteStyles.itemSubtitle}>
                      {[exp.empresa, formatPeriod(exp.periodo)].filter(Boolean).join("   ·   ")}
                    </Text>
                    <Text style={eleganteStyles.itemBody}>{exp.descricao}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={eleganteStyles.side}>
            {data.formacao.length > 0 ? (
              <View>
                <EleganteSectionTitle minPresenceAhead={35}>Formação</EleganteSectionTitle>
                {data.formacao.map((f, i) => (
                  <View key={i} style={eleganteStyles.eduItem} wrap={false}>
                    <Text style={eleganteStyles.eduTitle}>{f.curso}</Text>
                    <Text style={eleganteStyles.eduSub}>
                      {[f.instituicao, formatPeriod(f.periodo)].filter(Boolean).join(" · ")}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {data.habilidades.length > 0 ? (
              <View wrap={false}>
                <EleganteSectionTitle>Habilidades</EleganteSectionTitle>
                {data.habilidades.map((h, i) => (
                  <Text key={i} style={eleganteStyles.skillItem}>
                    {h}
                  </Text>
                ))}
              </View>
            ) : null}

            {data.idiomas.length > 0 ? (
              <View wrap={false}>
                <EleganteSectionTitle>Idiomas</EleganteSectionTitle>
                {data.idiomas.map((h, i) => (
                  <Text key={i} style={eleganteStyles.skillItem}>
                    {h}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}

export const RESUME_PDF_COMPONENTS: Record<
  ResumeTemplateSlug,
  (props: { data: ResumeData }) => React.ReactElement
> = {
  basico: BasicoPdf,
  moderno: ModernoPdf,
  executivo: ExecutivoPdf,
  criativo: CriativoPdf,
  elegante: ElegantePdf,
};
