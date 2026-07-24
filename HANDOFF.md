# Ryze — Handoff técnico

> Documento de contexto para o time técnico. Atualizado em 2026-07-18 (rodada de scroll + jornada do candidato).
> Repositório local: `C:\Users\ti\Documents\Projeto Ryze` — Git inicializado, commit inicial `063873e`.
> **Produção:** https://ryze-hr.vercel.app

## 1. Contexto de negócio

Site institucional + funil comercial da **Ryze — Consultoria em Recursos Humanos**, posicionamento "IA aplicada a RH". Três frentes:

- **`/consultoria`** — consultoria tradicional de RH (B2B), 4 serviços: Recrutamento e Seleção, Cultura Organizacional, Remuneração Estratégica, Treinamento e Desenvolvimento.
- **`/produtos`** — produtos de IA (B2B): Recrutamento com IA, Educação Corporativa.
- **`/para-candidatos`** — funil B2C de 3 planos: **Grátis** (R$0) → **Impulso** (R$19,90/mês) → **Mentoria** (R$49,90/mês, plano empurrado como principal). Grátis é a isca de topo de funil (currículo com IA + grupo de WhatsApp); Mentoria é o ticket que a empresa quer priorizar.

A home é **B2B-first**: consultoria e produtos são o gancho principal; candidatos têm um botão dedicado no canto do menu ("Sou candidato"), não competem pela atenção na home.

## 2. Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | Next.js 16.2.10 (App Router, Turbopack) | Versão recente — comportamento pode divergir do que modelos de IA "sabem" de treino; há docs locais em `node_modules/next/dist/docs/`. **Next 16 renomeou `middleware.ts` → `proxy.ts`** (export `proxy`, não `middleware`) |
| Linguagem | TypeScript | strict mode |
| UI | React 19 | Server Components por padrão; Client Components (`"use client"`) só onde há interatividade |
| Estilo | Tailwind CSS v4 | config **CSS-first** em `src/app/globals.css` (`@theme inline`), não há `tailwind.config.ts` |
| Componentes | Autorais (não é shadcn/ui, mas segue padrão similar) | `class-variance-authority` + `tailwind-merge` (customizado — ver §7) + `@radix-ui/react-slot` |
| Banco / Auth | Supabase (Postgres + Auth) | `@supabase/ssr` com sessão persistida via cookies (`src/proxy.ts` renova o token a cada request) |
| Pagamentos | Stripe (Checkout + Subscriptions + Webhooks) | SDK `stripe` (server-only); webhook local **e** de produção configurados e testados |
| IA (Fase 4) | OpenAI (`gpt-5.4-mini`) | Chave **paga**, uso definitivo. Ver §5.2 sobre sensibilidade da chave. Toda chamada passa por `src/lib/ai/client.ts` (único ponto de acesso à API externa) |
| PDF (Fase 4) | `@react-pdf/renderer` | Gera o PDF do currículo **no navegador** (client-side), a partir dos mesmos componentes de modelo visual — sem Puppeteer/Chromium headless |
| Agendamento (Fase 4b) | Cal.com (API v2 + `@calcom/embed-react` + webhook) | Sessão mensal do plano Mentoria. **API v1 foi descontinuada** — tudo usa v2 (`api.cal.com/v2`). Ver §5.2.3 |
| E-mail transacional (planejado) | Resend | Ainda não integrado |
| Deploy | Vercel | Projeto `ryze-hr`, time `projeto-ec` |

## 3. Estrutura de pastas

```
src/
├── app/                          # rotas (App Router)
│   ├── page.tsx                  # Home
│   ├── consultoria/              # hub + 4 subpáginas
│   ├── produtos/                 # hub + 2 subpáginas
│   ├── para-candidatos/
│   │   ├── page.tsx              # planos (funil PAS completo)
│   │   ├── comecar/              # rota legada (Fase 3) — ver §5.6: hoje só mostra o link do
│   │   │                         # WhatsApp de novo pra quem já tem perfil, ou redireciona pro
│   │   │                         # formulário novo em painel/curriculo pra quem ainda não tem
│   │   ├── checkout/sucesso/     # retorno pós-pagamento Stripe
│   │   └── painel/               # Fase 4 — dashboard do candidato, protegido por login+plano
│   │       ├── page.tsx          # dashboard: badge do plano + 4 cards de ferramenta
│   │       ├── curriculo/        # currículo com IA — TODOS os planos; também o único formulário de
│   │       │   │                 # entrada do candidato agora (perfil base), ver §5.5.3/§5.6
│   │       │   ├── curriculo-workspace.tsx  # hub + perfil + fluxo Grátis + fluxo pago (máquina de estados)
│   │       │   ├── base-profile-form.tsx    # formulário do perfil base (multi-seção)
│   │       │   └── resume-editor.tsx        # campos editáveis + preview ao vivo + export PDF
│   │       ├── linkedin/         # upload de PDF do LinkedIn → análise por IA (Impulso/Mentoria)
│   │       ├── entrevista/       # simulação de entrevista por voz (chat) (Impulso/Mentoria)
│   │       └── mentoria/         # agendamento Cal.com — só Mentoria (Fase 4b)
│   │           └── booking-widget.tsx  # embed @calcom/embed-react (Client Component)
│   ├── cadastro/                 # signup + Server Action + integração Stripe
│   ├── login/                    # signin/signOut + Server Actions
│   ├── contato/                  # lead form + Server Action → Supabase
│   ├── api/
│   │   ├── webhooks/stripe/      # route handler do webhook do Stripe
│   │   ├── webhooks/calcom/      # route handler do webhook do Cal.com (Fase 4b)
│   │   └── ai/interview/         # route handler da simulação de entrevista (chat turn-by-turn)
│   ├── sobre/
│   ├── design-system/            # showcase interno (noindex), NÃO linkado no nav
│   └── admin/                    # Fase 5 — painel administrativo, protegido por admin_users
│       ├── layout.tsx            # chama requireAdmin() uma vez, cobre todas as páginas filhas + nav lateral
│       ├── page.tsx               # dashboard: métricas gerais
│       ├── leads/                 # tabela + filtro por tipo + status editável
│       ├── candidatos/            # tabela + busca por nome/e-mail
│       ├── ia/                    # custo de IA agregado por provedor/feature, 30 dias
│       ├── mentoria/              # todas as sessões de mentoria, futuras em destaque
│       └── equipe/                # só role='owner' — convidar/remover admins
├── components/
│   ├── ui/                       # primitivos (Button, Badge, Card, PricingCard, inputs...)
│   ├── brand/                    # motivo de marca: FoldArrow, FoldMesh, NeuralHero, Logo...
│   ├── layout/                   # Navbar (Server Component) + NavbarMenu (Client, auth-aware) + Footer
│   ├── painel/                   # plan-upsell.tsx — gate compartilhado "requer Impulso/Mentoria"
│   ├── resume-templates/         # 4 modelos de currículo, em par (preview HTML + documento react-pdf)
│   │   ├── preview.tsx           # HTML/Tailwind — usado no editor, no navegador
│   │   └── pdf.tsx               # @react-pdf/renderer — usado só na exportação em PDF
│   └── sections/                 # blocos compostos reutilizáveis entre páginas
├── lib/
│   ├── supabase/
│   │   ├── server.ts             # cliente cookie-aware p/ Server Components/Actions (async!) + getCurrentUserPlan()
│   │   ├── client.ts             # cliente de browser (Client Components)
│   │   ├── admin.ts              # service_role — só o webhook usa, ignora RLS
│   │   └── middleware.ts         # updateSession() — usado por src/proxy.ts
│   ├── stripe/server.ts
│   ├── ai/
│   │   ├── client.ts             # ⚠️ ÚNICO ponto de acesso à API de IA externa — ver §5.1
│   │   └── usage.ts              # logAiUsage() — grava em ai_usage_log, nunca lança erro
│   ├── plans.ts                  # fonte única dos 3 planos de candidato
│   ├── resume-schema.ts          # schema do currículo estruturado (ResumeData) + os 4 modelos + validação de plano
│   ├── pdf.ts                    # extractPdfText() — ⚠️ ver §7 sobre o worker do pdfjs-dist
│   ├── mentoring.ts              # getCurrentCycleRange() — definição do ciclo mensal da Mentoria
│   ├── calcom/client.ts          # cancelCalcomBooking() — único ponto de acesso à API do Cal.com
│   ├── admin/
│   │   ├── auth.ts               # ⚠️ requireAdmin()/requireOwner() — ÚNICO ponto de checagem de acesso admin
│   │   └── date-ranges.ts        # getCurrentMonthRange()/getLast30DaysRange()/isFutureDate()
│   └── utils.ts                  # cn() — ver §7 sobre o fix do tailwind-merge
└── proxy.ts                      # renova sessão do Supabase a cada request (era middleware.ts)

supabase/migrations/
  0001_leads.sql                  # leads de contato (anônimo, insert público)
  0002_subscriptions.sql          # 1 linha por assinatura Stripe, RLS: usuário só lê a própria
  0003_candidate_profiles.sql     # dados do candidato p/ IA gerar currículo (Fase 4), RLS: usuário lê/escreve a própria
  0004_candidate_ai_features.sql  # resume_versions, linkedin_analyses, interview_sessions, ai_usage_log (Fase 4)
  0005_resume_structured.sql      # resume_versions vira JSON estruturado + job_title + template_slug + policy de update
  0006_mentoring_sessions.sql     # histórico de agendamentos Cal.com (Fase 4b), escrita só via webhook/service_role
  0007_admin.sql                  # admin_users (Fase 5) + leads.status

.env.local.example                # todas as env vars documentadas
```

## 4. Design system (resumo)

- Paleta de marca fixa: `ink #2E2C2A`, `paper #F3F0EA`, `paper-dark #17140F`, gradiente accent `#FF8A4C → #E85C2A → #A83E1D`.
- **Dark mode via classe `.dark`**, não via `prefers-color-scheme` — default é sempre claro. Um script bloqueante no `<head>` (`layout.tsx`) aplica a classe antes do primeiro paint pra evitar flash.
- **Padrão importante de arquitetura**: qualquer subtree pode ser forçada para o escopo escuro independente do tema da página, aplicando `className="dark"` no wrapper (ex: Navbar e Footer são sempre grafite; o hero da Home é sempre escuro). Isso funciona porque os tokens semânticos (`--bg`, `--fg`, `--border`...) são redefinidos dentro de `.dark { ... }` em `globals.css`, e todo componente consome esses tokens via classes Tailwind (`bg-bg`, `text-fg`), nunca cor literal.
- Showcase completo de tokens/componentes em `/design-system` (rota interna, não indexada).

## 5. Status por fase

- [x] **Fase 1 — Design system**: completa e validada.
- [x] **Fase 2 — Páginas institucionais**: Home, Consultoria (hub+4), Produtos (hub+2), Sobre, Contato. Completa.
- [x] **Fase 3 — Funil de candidatos + pagamento**: **COMPLETA** (2026-07-15). Ver §5.1.
- [x] **Fase 4 — Painel do candidato + IA**: **COMPLETA** (2026-07-15), testada ponta a ponta com dados fictícios. Ver §5.2.
- [x] **Fase 4b — Agendamento Cal.com (Mentoria)**: **COMPLETA** (2026-07-16), testada ponta a ponta com reservas reais (canceladas depois). Ver §5.2.3.
- [x] **Fase 5 — Painel administrativo**: **COMPLETA** (2026-07-16), testada ponta a ponta com admin fictício. **Enviada à Vercel e confirmada em produção com a conta real do owner em 2026-07-17.** Ver §5.4/§5.5.
- [x] **Fase 6 — Análise de LinkedIn (markdown) + Currículo com IA v3 (perfil base estruturado)**: **COMPLETA** (2026-07-17), testada ponta a ponta e em produção. Ver §5.5.

### 5.1 Fase 3 — detalhamento (tudo testado ao vivo, não só codado)

- **Planos e funil** (`/para-candidatos`): estrutura PAS completa — hero → como funciona → agitação ("sozinho vs. com a Ryze") → depoimentos → planos → FAQ → CTA. Plano **Mentoria** é o destacado/recomendado (decisão comercial deliberada — Impulso funciona como "decoy" para empurrar o ticket mais alto).
  - ⚠️ **Depoimentos são fictícios/exemplo** (`src/app/para-candidatos/page.tsx`, array `testimonials`) — substituir por reais antes de publicar de verdade (depoimento falso apresentado como real é propaganda enganosa, CDC art. 37).
- **Cadastro/login reais** (`/cadastro`, `/login`) com **sessão persistida**: `@supabase/ssr` + `src/proxy.ts` renovando o cookie a cada request. Testado: login → cookie com validade de ~1 ano (não é cookie de sessão) → sobrevive refresh e navegação → logout funciona e reverte o estado do navbar.
- **Stripe Checkout** (planos pagos): `cadastro/actions.ts` cria a conta Supabase, depois cria uma `checkout.session` e redireciona para a página hospedada do Stripe. Testado com pagamento de teste real (cartão `4242...`).
- **Webhook do Stripe** (`/api/webhooks/stripe`) grava/atualiza `subscriptions`: trata `checkout.session.completed`, `customer.subscription.updated` (cobre upgrade/downgrade) e `customer.subscription.deleted` (cancelamento). Testado localmente via Stripe CLI **e** com uma assinatura de teste real ponta a ponta (linha gravada no Supabase, depois cancelamento verificado). **Endpoint de produção também está registrado** (`we_1TtUKOCyznRM0X1xZtxZaGJA`, ver §6).
- **Fluxo do plano Grátis** (`/para-candidatos/comecar`): ~~após cadastro grátis, formulário captura nome/telefone/cargo-alvo/resumo de experiência~~ — **descrição histórica, substituída em 2026-07-17 (ver §5.6)**: o formulário curto foi consolidado no "Preencher perfil" completo de `/painel/curriculo`; `/comecar` hoje só reexibe o link do WhatsApp pra quem já tem perfil. Testado à época com os dois estados do link (configurado e não configurado).
- `/contato`: formulário de lead, grava em `leads` via Server Action.
- Todas as 3 migrations (`0001`–`0003`) aplicadas no projeto Supabase real, não só localmente.

### 5.2 Fase 4 — detalhamento (testado ponta a ponta, dados fictícios)

Escopo desta etapa: **dashboard do candidato + 3 ferramentas de IA** (currículo, análise de LinkedIn, simulação de entrevista). Agendamento via Cal.com (recurso da Mentoria) foi implementado depois, na Fase 4b — ver §5.2.3.

> ⚠️ **REGRA DE SEGURANÇA (atualizada em 2026-07-16): a `OPENAI_API_KEY` atual é uma chave PAGA da OpenAI — não é mais tier gratuito, então o risco de compartilhamento de dados que existia com a chave anterior (Gemini/Google AI Studio) não se aplica aqui. Dados reais de candidatos já podem ser usados normalmente com esta chave.** Isso não significa que a chave deixou de ser sensível: **nunca** deve ser exposta no client-side (toda chamada já passa exclusivamente por `src/lib/ai/client.ts`, que roda só no servidor) e **nunca** deve ser commitada no Git — vive em `.env.local` (git-ignorado) **e já foi enviada como env var de produção na Vercel** (projeto `ryze-hr`, autorização explícita do cliente em 2026-07-16) — deploy de produção redisparado depois, `https://ryze-hr.vercel.app` já está rodando com ela.

- **Camada de abstração de IA** (`src/lib/ai/client.ts`): ponto único de acesso à API externa — `getAiClient()` retorna um cliente do SDK `openai`, e `AI_MODELS` centraliza qual modelo cada feature usa. Nenhum outro arquivo importa o SDK `openai` diretamente. Trocar de provedor (já aconteceu três vezes nesta fase: Anthropic → OpenAI → Gemini [temporário, tier gratuito] → OpenAI de novo, agora definitivo com chave paga) é uma mudança isolada nesse arquivo.
  - Provedor atual: **OpenAI** (`gpt-5.4-mini`, todas as 3 features), chave paga, uso definitivo (não mais temporário/teste).
  - **Escolha do modelo**: confirmada contra `GET /v1/models` com a chave real (a lista de modelos disponíveis muda com frequência — não confiar de olho fechado em nome "óbvio" de documentação). `gpt-5.4-mini` é o tier intermediário ("mini") da geração mais recente disponível nesta chave — nenhuma das 3 tarefas exige raciocínio de ponta (currículo e análise de LinkedIn reorganizam/comentam texto que o candidato já forneceu, a entrevista segue um roteiro com prompt de sistema bem definido), então o tier "mini" entrega qualidade de escrita em PT-BR suficiente por uma fração do custo do modelo cheio (`gpt-5.4`), e é mais robusto que o tier "nano" pra manter coerência num texto mais longo como o currículo. Testado e confirmado funcionando, inclusive `response_format: json_object` (usado pelo currículo estruturado).
- **Dashboard** (`/para-candidatos/painel`): exige login + registro em `candidate_profiles`; mostra o plano atual e 3 cards de ferramenta. **Currículo com IA é recurso de todos os planos, inclusive Grátis** — só Análise de LinkedIn e Simulação de entrevista exigem Impulso/Mentoria (gate via `components/painel/plan-upsell.tsx`).
- **Currículo com IA** (`/painel/curriculo`) — **reescrito na v2, ver §5.2.1**: candidato preenche cargo + descrição da vaga → IA devolve JSON estruturado (não mais texto solto) → renderizado em um de 4 modelos visuais → editável com preview ao vivo → exporta em PDF.
- **Análise de LinkedIn** (`/painel/linkedin`): candidato faz upload do PDF exportado do próprio perfil (não é scraping) → texto extraído no servidor (`pdf-parse` v2 via `src/lib/pdf.ts`, ver §7 sobre o bug do worker) → IA analisa e sugere melhorias → resultado salvo (upsert, 1 por usuário) em `linkedin_analyses`.
- **Simulação de entrevista** (`/painel/entrevista`): chat por voz — candidato fala, Web Speech API do navegador transcreve para texto **no cliente**, só o texto vai para o servidor (nenhum áudio trafega para qualquer API). Route handler (`/api/ai/interview`) conduz a entrevista (uma pergunta por vez, ~5-6 perguntas, depois feedback final) e persiste o transcript em `interview_sessions` a cada turno. Navegadores sem suporte a Web Speech API recebem aviso claro em vez de UI quebrada.
  - **Bug real encontrado e corrigido**: a Gemini rejeita (400 "contents is not specified") uma chamada que só tem mensagem `system`, sem nenhuma `user` — diferente da OpenAI/Anthropic, que aceitam isso normalmente. Isso quebrava exatamente o primeiro turno (o botão "Começar entrevista" manda a chamada de abertura sem mensagem do candidato ainda). Corrigido em `src/app/api/ai/interview/route.ts`: quando o transcript está vazio, uma mensagem `user` mínima ("Pode começar a entrevista.") é inserida antes de chamar a IA — ela não aparece pro candidato no chat (só a pergunta de abertura da IA aparece), mas fica registrada no `interview_sessions.transcript` salvo.
  - **Bug real encontrado e corrigido (relato de usuário)**: o tratamento de erro da gravação de voz mostrava sempre a mesma mensagem alarmante ("Não conseguimos captar o áudio") pra qualquer falha — inclusive o timeout de silêncio do próprio navegador, que é comum e não é um erro de verdade. Corrigido em `interview-chat.tsx`: o handler agora lê o código real do evento de erro da Web Speech API (`no-speech`, `not-allowed`, `audio-capture`, `network`, `aborted`...) e mostra uma mensagem específica pra cada caso — silêncio detectado tem um aviso ameno, permissão negada tem instrução específica, e o candidato parando a gravação de propósito não mostra erro nenhum.
- **Controle de acesso em profundidade**: todas as Server Actions/route handler checam o plano via `getCurrentUserPlan()` no servidor, não confiam só na UI escondendo o formulário.
- **`ai_usage_log`**: toda chamada de IA é logada (usuário, feature, modelo, tokens) via `logAiUsage()` — nunca lança erro, para não derrubar a feature principal se o log falhar. RLS habilitada, sem policy de leitura/escrita para `anon`/`authenticated` (só `service_role`, i.e. só o backend grava).

#### 5.2.1 Currículo com IA v2 — estruturado + modelos visuais + PDF (2026-07-15)

Mudança de escopo: em vez de currículo em texto solto, a IA agora devolve JSON estruturado (schema em `src/lib/resume-schema.ts`: nome, título, resumo, contato, experiências, formação, habilidades), renderizado por 4 componentes de modelo visual e exportável em PDF.

- **Modelos visuais**: **Básico** (uma coluna, tradicional — único modelo do plano Grátis) e 3 modelos pagos — **Moderno** (coluna lateral com contato/habilidades em destaque), **Executivo** (cabeçalho forte em grafite, seções formais) e **Criativo** (faixa de destaque na cor accent da marca). Cada modelo existe em duas versões que consomem os mesmos dados: um componente de preview em HTML/Tailwind (`src/components/resume-templates/preview.tsx`) e um componente `@react-pdf/renderer` pro PDF (`src/components/resume-templates/pdf.tsx`) — react-pdf não renderiza HTML/Tailwind, precisa da sua própria árvore de componentes (`Document`/`Page`/`View`/`Text`) e `StyleSheet`, por isso as cores da marca estão hardcoded como hex literal nesse arquivo (não dá pra usar variável CSS).
- **Seletor de modelo**: Grátis não vê seletor, usa "básico" direto. Impulso/Mentoria escolhem entre os 4 antes de gerar (e podem trocar depois, no editor). O slug escolhido nunca é confiado vindo do client — `resolveAllowedTemplate()` em `resume-schema.ts` revalida contra o plano real toda vez (na geração E ao salvar edição).
- **Edição com preview ao vivo**: depois de gerado, o currículo abre em um formulário editável (`resume-editor.tsx`) — cada campo é `useState` controlado, então o preview ao lado reflete a edição a cada tecla, sem precisar salvar primeiro. "Salvar alterações" persiste na mesma linha de `resume_versions` (`updateResumeVersion`, não cria uma versão nova a cada edição).
- **Exportação em PDF**: client-side via `@react-pdf/renderer` (`pdf(<Componente data={...} />).toBlob()`), sem Puppeteer/Chromium headless — mais leve pra rodar em serverless da Vercel, como pedido. Testado e confirmado: o blob gerado é um PDF válido (`%PDF-1.3` no header) em ambos os planos.
- **Histórico por vaga (só planos pagos)**: `resume_versions` ganhou as colunas `job_title` (preenchido pelo próprio candidato num campo do formulário — mais simples e confiável do que pedir pra IA extrair o cargo da descrição da vaga num JSON já complexo) e `template_slug`. A lista de "Versões anteriores" mostra cargo + data; clicar em um item reabre no editor com os dados e o modelo daquela versão específica.
  - **Bug real encontrado e corrigido**: a lista de versões vem do Server Component (`page.tsx`) e não se atualizava sozinha — um currículo recém-gerado só aparecia na lista depois de um F5 manual. Corrigido chamando `router.refresh()` no clique do botão "Gerar outro currículo" (**não** no corpo do render — a primeira tentativa chamou `router.refresh()` durante uma atualização de estado síncrona no render, o que é side effect impuro nesse contexto e interferia com a própria transição de tela pro editor).
- **Migration `0005_resume_structured.sql`**: substitui a antiga coluna de texto livre (`generated_content`) por `resume_data jsonb`, `job_title text`, `template_slug text` (com `check` dos 4 slugs válidos) e `updated_at`; adiciona a policy de UPDATE que faltava (só existiam select/insert antes — necessária agora porque o candidato edita o currículo depois de gerado).

#### Evidência dos testes (2026-07-15)

**Bug 1 — regressão de acesso (Grátis sem Currículo com IA)**: confirmado no dashboard antes da correção (badge "Impulso+" nas 3 ferramentas) e depois (badge só em LinkedIn/Entrevista, Currículo liberado). Testado de ponta a ponta com usuário fictício Grátis.

**Bug 2 — erro de gravação de voz**: código corrigido e revisado; não dá pra simular um erro real de microfone num navegador automatizado headless, mas a lógica de despacho por `event.error` foi conferida contra os valores documentados da Web Speech API.

**Bug 3 — Análise de LinkedIn**: reproduzido e corrigido de verdade, não só no código — anexei um arquivo real a um `<input type="file">` via `DataTransfer` (a única forma de simular upload sem clique nativo de SO) e submeti o formulário de verdade:
- PDF pequeno (1,5KB): 500 antes da correção (`Setting up fake worker failed: Cannot find module pdf.worker.mjs` — o `pdf-parse`/pdfjs-dist não conseguia carregar seu worker dentro do bundle do Turbopack). Corrigido apontando o worker pro arquivo real em `node_modules` (`src/lib/pdf.ts`) — 200 OK depois, análise real da Gemini retornada e exibida na UI.
- PDF de 1,5MB (tamanho realista de um export do LinkedIn com foto): 500 "Body exceeded 1 MB limit" antes — Next.js Server Actions têm limite de 1MB por padrão. Corrigido subindo pra 8MB em `next.config.ts` — 200 OK depois.
- PDF de 7MB: rejeitado no client antes mesmo de enviar, com mensagem amigável (limite de 6MB, com margem pro overhead do multipart) — sem crash.

**Fluxo Grátis (Currículo com IA)** — testado de ponta a ponta pela UI real com um segundo usuário fictício (`teste.fase4.gratis@example.com`, plano Grátis puro, sem assinatura):
1. Dashboard mostra "Plano Grátis" com Currículo liberado, sem seletor de modelo na página da ferramenta.
2. Geração: preencheu cargo + vaga fictícia → JSON estruturado gerado corretamente a partir do `candidate_profiles`, renderizado no modelo Básico. Confirmado gravado em `resume_versions` com `template_slug: "basico"`.
3. Edição: alterou o campo "Título profissional" → preview atualizou na hora → "Salvar alterações" → confirmado persistido via `SELECT` direto no Supabase.
4. PDF: interceptei `URL.createObjectURL` no navegador pra capturar o Blob gerado pelo botão "Baixar em PDF" antes do download — `%PDF-1.3`, 3059 bytes, `type: application/pdf`. PDF válido confirmado por assinatura de bytes, não só "sem erro no console".

**Fluxo Impulso/Mentoria (Currículo com IA)** — testado com o usuário fictício `teste.fase4.candidato@example.com` (Mentoria):
1. Seletor de modelo mostra os 4 (Básico/Moderno/Executivo/Criativo) antes de gerar.
2. Gerou com modelo **Moderno** (cargo "Analista de Recrutamento e Seleção Sênior") — preview em duas colunas confirmado, `template_slug: "moderno"` persistido.
3. Editou e salvou — confirmado persistido.
4. PDF baixado e validado por assinatura de bytes (`%PDF-1.3`, 3365 bytes) — mesmo método do teste do Grátis.
5. Gerou uma segunda vaga ("Analista de RH Júnior") com modelo **Executivo** — layout de cabeçalho formal confirmado.
6. Histórico: as duas gerações apareceram na lista "Versões anteriores" com o cargo certo (não "Vaga sem título"); clicar em uma reabre o editor com os dados e o modelo daquela versão específica — testado clicando de volta no item "Analista de RH Júnior" e conferindo que reabriu com o layout Executivo e os dados certos.

`npm run lint` e `npm run build` limpos após todas as correções (26 rotas).

**Nota sobre o ambiente de teste**: o Browser pane usado nesta sessão teve instabilidade pontual no clique por coordenada/`ref` do `computer` tool (cliques que não registravam, sem erro visível) — não é um bug do produto. Contornado disparando os mesmos eventos via JavaScript no contexto da página (setar valor + `dispatchEvent('input')`, `element.click()`, `form.requestSubmit()`), que é equivalente ao que um clique real produz.

#### 5.2.2 Troca de provedor: Gemini → OpenAI definitivo (2026-07-16)

Motivo: cliente forneceu uma chave paga da OpenAI, eliminando o motivo original de usar o Gemini (tier gratuito só pra testes, ver §5.2.1 antigo). Mudança isolada em `src/lib/ai/client.ts`, como o design da camada de abstração promete.

- **Modelo escolhido**: `gpt-5.4-mini` pras 3 features — mesmo modelo, decisão documentada acima em §5.2. Confirmado via `GET /v1/models` (a chave tem acesso a toda a família `gpt-5.x`, incluindo tiers `nano`/`mini`/cheio/`pro`) e chamada real de teste, incluindo `response_format: json_object`.
- **Evidência do teste ponta a ponta** (usuário fictício `teste.fase4.candidato@example.com`, Mentoria):
  1. **Currículo com IA**: gerado com sucesso, JSON estruturado válido, renderizado no modelo Básico. `ai_usage_log` confirma `model: "gpt-5.4-mini"`, 840 tokens.
  2. **Análise de LinkedIn**: PDF real anexado via `DataTransfer` e enviado pelo formulário de verdade (mesmo método do teste do Bug 3) — extração de texto e análise funcionaram sem alterações (a troca de provedor não afeta `src/lib/pdf.ts`, que é provider-agnostic). `ai_usage_log` confirma `model: "gpt-5.4-mini"`, 1947 tokens.
  3. **Simulação de entrevista**: "Começar entrevista" gerou a pergunta de abertura corretamente; um segundo turno (resposta fictícia) confirmou memória real da conversa (a IA referenciou a resposta anterior). `ai_usage_log` confirma `model: "gpt-5.4-mini"` em ambos os turnos (367 e 263 tokens). A mensagem `user` sintética inserida quando o transcript está vazio (fix do Bug da Gemini, §5.2) continua rodando — inofensiva pra OpenAI (que aceita mensagem só de `system` normalmente), mas não foi removida porque não há necessidade: simplifica manter o mesmo caminho de código pros dois provedores.
- `npm run lint` e `npm run build` limpos após a troca (26 rotas).
- **`OPENAI_API_KEY` enviada à Vercel em 2026-07-16** (autorização explícita do cliente, após os testes locais confirmarem tudo funcionando) — variável de produção adicionada ao projeto `ryze-hr` via API da Vercel, deploy de produção redisparado na sequência (`https://ryze-hr.vercel.app` já serve a versão com IA via OpenAI).

### 5.2.3 Fase 4b — Agendamento Cal.com (Mentoria) (2026-07-16)

Sessão mensal de 30 min com consultor, exclusiva do plano Mentoria (não Impulso). Um consultor único por enquanto — sem lógica de múltiplos hosts/round-robin.

- **API do Cal.com**: **v1 foi descontinuada** (`GET /v1/...` responde 410 "decommissioned") — tudo implementado contra **v2** (`api.cal.com/v2`), confirmado com chamadas reais usando a chave do cliente antes de codar qualquer coisa. Alguns endpoints exigem o header `cal-api-version` com uma data específica (ex: `2026-02-25` pra cancelar reserva) — varia por endpoint, não é um valor único pra API inteira.
- **Event type**: id `6334839` ("Sessão de Mentoria — Ryze", 30min), confirmado via `GET /v2/event-types` — hardcoded em `src/lib/calcom/client.ts` (`MENTORING_EVENT_TYPE_ID`) pra o webhook ignorar eventos de outros event types que a conta ganhe no futuro.
- **Camada de acesso** (`src/lib/calcom/client.ts`): só expõe `cancelCalcomBooking()` — é só o que o backend precisa fazer via API (a criação da reserva acontece do lado do candidato, pelo widget embutido; ver abaixo).
- **Página** (`/painel/mentoria`): protegida por `getCurrentUserPlan() === "mentoria"` (não "impulso ou mentoria" — só o plano mais alto tem esse benefício). Dois estados:
  - **Sem sessão confirmada no ciclo atual**: embute o widget oficial via `@calcom/embed-react` (`<Cal calLink="andre-cavalcanti-ycpcvc/30min" config={{name, email, "supabase-user-id": userId}} />`), pré-preenchido com nome/e-mail do `candidate_profiles` do candidato **e** o `user_id` do Supabase num campo oculto (ver "Vínculo candidato↔reserva" abaixo).
  - **Já tem sessão confirmada no ciclo**: mostra data/hora e um link pra `https://cal.com/booking/{uid}` — a própria página de gerenciamento nativa do Cal.com, que já tem "Reagendar"/"Cancelar" prontos (aproveitando o recurso deles em vez de reimplementar).
- **Definição de "ciclo"** (`src/lib/mentoring.ts`): **mês corrente (dia 1 ao último dia)**, não a data de início da assinatura. Escolha deliberada — mais simples de calcular certo (não depende de ler `current_period_start` do Stripe a cada checagem) e alinhada com "1 sessão por mês" como o negócio já pensa o benefício. A checagem usa `scheduled_at` da sessão (em que mês ela VAI ACONTECER), não a data em que foi marcada.
- **Webhook** (`/api/webhooks/calcom`, `src/app/api/webhooks/calcom/route.ts`): assinatura verificada via header `x-cal-signature-256` (HMAC-SHA256 sobre o corpo cru, comparação em tempo constante) — mecanismo confirmado na documentação oficial antes de implementar, não assumido. Trata `BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`.
  - **Regra de negócio real, não só de tela**: ao receber `BOOKING_CREATED`, o webhook resolve o candidato (ver abaixo), confirma que ele tem assinatura Mentoria **ativa** (defesa em profundidade — o link do Cal.com é público, então isso cobre o caso de alguém agendar direto por ele sem passar pela página protegida) e checa se já existe outra sessão `confirmed` no mesmo ciclo. Se qualquer uma dessas checagens falhar, o webhook **cancela a reserva automaticamente via API do Cal.com** (com um motivo explicativo) e nunca grava a linha em `mentoring_sessions` — ou seja, mesmo que o candidato ache um jeito de contornar a tela (abrir o widget em duas abas, usar o link público direto), o servidor não deixa uma segunda reserva sobreviver.
  - **`BOOKING_RESCHEDULED`**: o payload real inclui `rescheduleUid` (uid da reserva anterior) — confirmado na documentação, não adivinhado. O handler marca a reserva antiga como `'rescheduled'` e processa a nova pelas mesmas regras de `BOOKING_CREATED` (a antiga já não conta mais como `'confirmed'`, então não gera falso conflito de ciclo).
  - **Vínculo candidato↔reserva** (`resolveCandidateUserId()` em `route.ts`, **revisado em 2026-07-16** — ver §5.2.4): **caminho primário é por ID**, não por e-mail. O event type ganhou um campo customizado oculto (`supabase-user-id`, criado via `PATCH /v2/event-types/6334839`), pré-preenchido pelo embed com o `user.id` real da sessão logada — o candidato nunca vê nem edita esse campo. O webhook lê esse valor de `payload.responses["supabase-user-id"].value` e só o aceita se o e-mail do attendee bater com o e-mail cadastrado pra esse `user_id` (proteção contra alguém forjar o parâmetro na URL pra atribuir a reserva à conta de outra pessoa). **Fallback por e-mail** continua existindo pra reservas feitas direto pelo link público do Cal.com (sem passar pela nossa página, logo sem o campo oculto).
- **Webhook registrado via API** (mesmo padrão do Stripe): `POST /v2/webhooks` apontando pra `https://ryze-hr.vercel.app/api/webhooks/calcom`, com um secret gerado por nós (`CALCOM_WEBHOOK_SECRET`, não é algo que o Cal.com fornece) enviado na criação.
- **Migration `0006_mentoring_sessions.sql`**: uma linha por reserva (histórico completo, como `resume_versions`), `status` cobrindo `'confirmed'`/`'cancelled'`/`'rescheduled'`. RLS: candidato só lê a própria — **sem policy de insert/update pra `authenticated`**, igual a `subscriptions`: quem escreve é sempre o webhook via `service_role`, nunca o candidato diretamente.

#### Evidência do teste ponta a ponta (2026-07-16, com reservas reais canceladas em seguida)

⚠️ O Cal.com **não tem modo sandbox** — a chave do cliente é live. Testar de verdade significa criar reservas reais no calendário real dele. Usei um e-mail de attendee fictício (`teste.fase4.candidato@example.com`, o mesmo candidato de teste de sempre) pra não incomodar ninguém real, e cancelei cada reserva de teste imediatamente depois de confirmar o comportamento — nenhuma ficou pendente no calendário.

1. **Agendar** — reserva criada direto via `POST /v2/bookings` (equivalente ao que o widget produz), horário real disponível obtido via `GET /v2/slots`. Confirmado `201`.
2. **Webhook disparou de verdade** — não foi simulado: o Cal.com real chamou o endpoint de produção real. `mentoring_sessions` mostrou a linha nova em poucos segundos, com `user_id`, `cal_booking_uid` e `scheduled_at` corretos, `status: "confirmed"`.
3. **Segunda reserva no mesmo mês bloqueada de verdade** — criada uma segunda reserva (outro horário, mesmo mês). O Cal.com aceitou normalmente (ele não sabe da nossa regra de negócio), mas o webhook **cancelou essa reserva automaticamente pela API** (confirmado consultando `GET /v2/bookings/{uid}` depois: `status: "cancelled"`, com o motivo customizado que o código gera) e **nenhuma linha extra foi inserida** em `mentoring_sessions` — só a primeira reserva continuou lá.
4. **Cancelamento** — cancelada a primeira reserva via API. O webhook atualizou a linha em `mentoring_sessions` pra `status: "cancelled"` em poucos segundos.
5. **UI real (produção)**, testada com o candidato de teste logado:
   - Sem sessão confirmada: o `<iframe>` do embed realmente carregou (`src=".../embed?name=...&email=..."`, `loading="done"`), pré-preenchido com nome/e-mail do candidato — confirmado inspecionando o DOM, não só "sem erro no console".
   - Com sessão confirmada (criei uma terceira reserva de teste pra ver esse estado): a página mostrou "Sua sessão está confirmada" com data/hora certas e o link "Gerenciar sessão" apontando pro uid certo. Segui o link até `https://cal.com/booking/{uid}` — a página nativa do Cal.com carregou com as opções "Reagendar ou Cancelar" visíveis, confirmando que o recurso nativo deles está sendo aproveitado como pedido (não reimplementado). Reserva cancelada em seguida pela API.
   - **Gate por plano**: testado com o candidato fictício do plano Grátis — mostra "Sessão de Mentoria é um recurso Mentoria" (mensagem específica, não a genérica "Impulso e Mentoria" usada pelas outras ferramentas).
6. `npm run lint` e `npm run build` limpos (28 rotas). Env vars (`CALCOM_API_KEY`, `CALCOM_WEBHOOK_SECRET`, `NEXT_PUBLIC_CALCOM_LINK`) enviadas à Vercel e deploy de produção redisparado antes do teste — o teste acima rodou contra o site de produção de verdade, não localhost.

### 5.2.4 Vínculo candidato↔reserva por ID, não por e-mail (2026-07-16)

Resolvia a limitação registrada em §5.2.3/§5.3: correspondência por e-mail sozinha corria risco de erro de digitação/edição do candidato no formulário do Cal.com.

- **Investigado antes de implementar**: confirmado que Cal.com suporta campo de agendamento customizado oculto (`PATCH /v2/event-types/{id}` com `bookingFields`, incluindo `hidden: true`) e que esse valor aparece de volta no payload do webhook em `payload.responses["<slug>"].value` — confirmado na documentação oficial (variável `responses`, com exemplo real mostrando `isHidden: true`), não assumido.
- **Implementado**: campo oculto `supabase-user-id` criado no event type (a chamada de `PATCH` exige o array `bookingFields` **completo** — substituir parcialmente apaga os campos não enviados; teve que incluir todos os campos default de novo, com `label` explícito em cada um, já que a validação da API rejeita omitir `label`). O embed (`booking-widget.tsx`) agora recebe `userId` como prop e inclui `"supabase-user-id": userId` no `config` — confirmado por inspeção do DOM que isso vira `?supabase-user-id=<uuid>` na URL do iframe real.
- **`resolveCandidateUserId()`** no webhook: tenta o campo oculto primeiro; só aceita esse valor se o e-mail do attendee bater com o e-mail cadastrado pra esse `user_id` (proteção contra forjar o parâmetro na URL pra atribuir reserva a outra conta — o campo oculto sozinho não é prova de identidade, é só um parâmetro de URL que, em teoria, dá pra manipular). Se não bater (ou o campo não vier), cai no fallback por e-mail de sempre.
- **Opção 2 do pedido** (travar o campo de e-mail como somente-leitura) não foi necessária — a Opção 1 (campo customizado) se mostrou viável e é uma solução mais robusta.

#### Evidência (2026-07-16, reservas reais canceladas em seguida)

1. **Campo oculto confirmado na URL real do embed em produção**: `iframe.src` incluiu `supabase-user-id=f5bdea64-2d30-46fc-b645-1dade762bf83` (o `user.id` real do candidato de teste logado) — inspecionado via DOM, não assumido.
2. **Vínculo por ID funcionando**: reserva real criada via API com `bookingFieldsResponses: {"supabase-user-id": "<uuid correto>"}` e e-mail correto → `mentoring_sessions` gravou a linha certa.
3. **Proteção contra forjar o campo testada de propósito**: reserva real criada com o `user_id` correto só que **e-mail do attendee diferente** (não cadastrado) → o webhook detectou a inconsistência, **não** atribuiu a reserva a ninguém (nenhuma linha gravada) — confirma que o cross-check e-mail↔ID está funcionando, não só o caminho feliz.
4. **Fallback por e-mail continua funcionando**: reserva real criada **sem** o campo oculto (simulando alguém que agendou pelo link público, fora da nossa página) → o webhook resolveu o candidato certo por e-mail (confirmado indiretamente: a regra de "já tem sessão no ciclo" disparou corretamente pra esse mesmo candidato, o que só acontece se ele foi identificado certo).
5. Todas as 3 reservas reais de teste desta rodada foram canceladas depois — `mentoring_sessions` sem nenhuma linha `'confirmed'` sobrando.
6. `npm run lint` e `npm run build` limpos. Deploy de produção redisparado antes do teste (o teste rodou contra `https://ryze-hr.vercel.app` de verdade).

### 5.3 Pendências (nenhuma bloqueia o uso — registradas, não esquecidas)

1. **Link do grupo de WhatsApp** — `NEXT_PUBLIC_WHATSAPP_GROUP_LINK` está vazio (fallback gracioso: mostra "link chega em breve"). Aguardando o link real do cliente.
2. **Performance**: todo o site virou renderização dinâmica (perdeu pré-geração estática) porque o Navbar lê a sessão em toda página. Trade-off conhecido — existe correção via Partial Prerendering, não implementada (feature ainda em evolução no Next.js, não mexida sem aprovação explícita).
3. **Depoimentos fictícios** — ver 5.1.
4. **Modo Live do Stripe**: hoje tudo roda em modo de **TESTE**. Trocar para produção de verdade quando o negócio estiver pronto para cobrar (ver §6 — vai precisar de um novo endpoint de webhook e chaves `sk_live_`).
5. ~~`GEMINI_API_KEY` é temporária/tier gratuito~~ — **resolvido em 2026-07-16**: trocado para `OPENAI_API_KEY`, chave paga, já em produção (ver §5.2.2).
6. **Upload de PDF do LinkedIn nunca foi clicado por um `<input type="file">` de verdade via clique nativo do SO** — testado via `DataTransfer` (o mais próximo que dá pra simular sem um clique real de usuário) em várias rodadas, sempre com sucesso. Vale um teste manual humano (clicando "Escolher arquivo" de verdade) antes de considerar 100% validado, mas o risco residual é baixo.
7. **Usuários fictícios de teste ainda no Supabase** — `teste.fase4.candidato@example.com` (Mentoria), `teste.fase4.gratis@example.com` (Grátis) e `teste.fluxo.novo.zero@example.com` (Grátis, criado em 2026-07-17 pra testar o fluxo de entrada consolidado do zero — ver §5.6), e as linhas associadas (`candidate_profiles`, `subscriptions`, `resume_versions`, `linkedin_analyses`, `interview_sessions`, `ai_usage_log`, `mentoring_sessions`) foram deixados no banco de propósito, para você conferir a evidência. Remover quando não precisar mais.
   - **`teste.mentoria.pago@example.com`** (Mentoria fictícia, criada em 2026-07-17 — ver §5.7.5) é diferente das outras: foi criada de propósito **para você usar** e testar os recursos pagos (seletor de modelos, adaptar para vaga, agendamento), não é lixo de teste automatizado — só remover quando você não precisar mais dela, não junto com a limpeza automática das demais.
8. ~~Correspondência candidato↔reserva do Cal.com é por e-mail~~ — **resolvido em 2026-07-16**: agora é por ID (campo customizado oculto no event type, com e-mail como cross-check/fallback). Ver §5.2.4. O único caso que ainda cai no fallback por e-mail puro é reserva feita direto pelo link público do Cal.com, fora da nossa página — cenário incomum, não uma falha do fluxo normal.
9. **Cinco reservas de teste reais foram criadas e canceladas no Cal.com do cliente durante os testes ponta a ponta** (2026-07-16, duas rodadas) — não sobrou nada pendente no calendário, mas o histórico de "criado → cancelado" fica visível no painel do Cal.com caso o cliente note.
10. ~~Owner real inserido em `admin_users` em 2026-07-16 — verificação de login com a conta real ainda pendente~~ — **resolvido em 2026-07-17**: cliente confirmou login com a conta real (`andre.caval.17@hotmail.com`) funcionando em produção. Ver §5.5.1.
11. **Usuários fictícios de teste do painel admin ainda no Supabase** — `teste.fase5.owner@example.com` (owner de teste). O segundo admin fictício convidado durante o teste já foi removido pelo próprio fluxo de remoção (ver §5.4), não precisa de limpeza manual.

### 5.4 Fase 5 — Painel administrativo (2026-07-16)

Reaproveita o Supabase Auth já existente — sem sistema de login separado. Toda a autorização passa por uma única tabela (`admin_users`) e uma única função de checagem.

- **Modelo de acesso**: `admin_users` (`user_id`, `role` — `'owner'` ou `'admin'`, `invited_by`) com RLS que só deixa cada admin ler a **própria** linha — sem policy de insert/update/delete pra `authenticated` (só `service_role` escreve, igual ao padrão já usado em `subscriptions`/`ai_usage_log`).
- **`requireAdmin()`/`requireOwner()`** (`src/lib/admin/auth.ts`) — ponto único de verificação, sem duplicar lógica em cada página:
  1. Confirma sessão + presença em `admin_users` com o **cliente normal** (respeita RLS).
  2. Só depois disso o caller passa a usar `getSupabaseAdminClient()` (service_role) pra buscar dados de todos os usuários.
  - Chamado uma vez em `src/app/admin/layout.tsx` (cobre toda página admin automaticamente) **e** de novo, individualmente, dentro de cada Server Action (`updateLeadStatus`, `inviteAdmin`, `removeAdmin`) — Server Actions não passam pelo layout, então cada uma precisa da própria checagem.
  - Não-admin é redirecionado pra `/` em silêncio — sem página/mensagem de "acesso negado" que confirme a existência da área.
- **6 páginas**, todas dentro do shell escuro forçado (`className="dark"` no layout, mesmo padrão do Navbar/Footer — o admin lê como parte do mesmo produto, não uma ferramenta genérica):
  1. **`/admin`** — cards de candidatos por plano, MRR estimado (Impulso × R$19,90 + Mentoria × R$49,90), leads no mês, chamadas de IA no mês.
  2. **`/admin/leads`** — tabela com filtro por tipo (query param `?tipo=`) e um `<select>` de status por linha (`novo`/`contatado`/`convertido`/`descartado`) que salva direto ao trocar.
  3. **`/admin/candidatos`** — nome, e-mail, plano ativo (derivado de `subscriptions`, fallback pra "Grátis" se não há assinatura ativa), status da assinatura, data de cadastro. Busca por nome/e-mail via `?q=`.
  4. **`/admin/ia`** — `ai_usage_log` agregado por provedor × funcionalidade nos últimos 30 dias. **Provedor é inferido do prefixo do nome do modelo** (`gpt-`/`o1`/`o3`/`o4` → OpenAI, `gemini-` → Google Gemini, `grok-` → xAI Grok) — a tabela não guarda o provedor como coluna separada, então isso cobre o histórico real desta conta (que já passou por Gemini e OpenAI) sem precisar migrar dado.
  5. **`/admin/mentoria`** — `mentoring_sessions` com nome do candidato (join em JS com `candidate_profiles`, já que as duas tabelas referenciam `auth.users` separadamente, não uma à outra), ordenado por `scheduled_at`, sessões futuras e confirmadas destacadas.
  6. **`/admin/equipe`** (só `role='owner'`, com `requireOwner()` chamado de novo na própria página além do layout) — lista de admins com e-mail resolvido via `supabase.auth.admin.getUserById()`, formulário de convite, botão de remoção com a trava de "não remover o único owner".
- **Convite de admin**: se o e-mail já tem conta no Supabase Auth, só vira admin; se não, usa `supabase.auth.admin.inviteUserByEmail()` (cria a conta e manda e-mail de convite de verdade).

#### Bug real encontrado e corrigido no teste ponta a ponta

`GET /auth/v1/admin/users?email=...` **não filtra server-side neste projeto** — devolve todos os usuários, ignorando o parâmetro. O código original fazia `users?.[0]` achando que already vinha filtrado, o que combinou com o primeiro usuário da lista completa (por acaso, o próprio owner) em vez de reconhecer que o e-mail convidado era novo — a tentativa de invite colidiu com a constraint `unique` de `admin_users` e retornou "esse usuário já é admin" sem nunca ter convidado ninguém de verdade. Como o índice único bloqueou a escrita, nenhum dado foi corrompido, mas em outro cenário (primeiro usuário da lista sem linha em `admin_users` ainda) isso teria **atribuído acesso de admin a um usuário completamente errado** — bug de correção/segurança real, não cosmético. Corrigido em `findUserIdByEmail()` (`src/app/admin/equipe/actions.ts`): busca a lista completa (`per_page=1000`) e filtra por e-mail exato (case-insensitive) no código, em vez de confiar no parâmetro da API.

#### Evidência do teste ponta a ponta (2026-07-16, admin fictício)

Criado um owner fictício (`teste.fase5.owner@example.com`) inserido direto via `service_role` (do mesmo jeito que o cliente vai inserir o owner real — ver instrução no fim deste documento).

1. **Acesso negado silencioso**: logado como o candidato fictício de sempre (não-admin), `GET /admin` redirecionou pra home sem nenhuma mensagem — confirmado pelo título da página mudar pra "Ryze — Consultoria em Recursos Humanos".
2. **Dashboard**: carregou com números reais dos dados fictícios já existentes no banco (1 candidato Grátis, 1 Mentoria, MRR R$49,90, 20 chamadas de IA no mês).
3. **Leads**: criado um lead fictício direto no banco pra testar — apareceu na tabela; trocar o `<select>` de status pra "Contatado" persistiu de verdade (confirmado via `SELECT` direto no Supabase).
4. **Candidatos**: os dois candidatos fictícios de fases anteriores apareceram com plano/status corretos; busca por "gratis" filtrou pro candidato certo.
5. **Custo de IA**: agregação real dos `ai_usage_log` de todas as fases anteriores — separou corretamente `Google Gemini` (linhas de quando esse era o provedor) de `OpenAI` (provedor atual), por funcionalidade.
6. **Mentoria**: as 3 reservas de teste (todas canceladas, de fases anteriores) apareceram com nome/e-mail do candidato certo. Testado também o destaque "Futura" inserindo uma linha fictícia com `status='confirmed'` e data futura direto no banco (não uma reserva real do Cal.com — só pra testar a UI) e removendo em seguida.
7. **Convite de admin**: primeira tentativa com `@example.com` falhou de verdade (`email_address_invalid` — a Supabase valida entregabilidade no convite real, diferente da criação direta usada pros outros usuários fictícios deste projeto). Repetido com um endereço `@gmail.com` fictício (mesmo padrão já usado em fases anteriores) — convite aceito, usuário criado, `admin_users` gravado com `role='admin'`.
8. **Admin comum sem acesso a `/admin/equipe`**: logado como o admin convidado (senha setada manualmente via API admin, só pra login de teste), o link "Equipe" não aparece na navegação, e acessar a URL direto redireciona pra `/admin` (não pra home — já é admin, só não é owner).
9. **Trava do último owner**: logado de novo como owner, tentar remover a própria linha (único owner) devolveu "Não é possível remover o único owner." — a linha continuou lá.
10. **Remoção normal**: removido o admin convidado — sumiu da lista imediatamente, e logado como esse usuário depois, `/admin` redirecionou pra home (perdeu o acesso por completo).
11. `npm run lint` e `npm run build` limpos (34 rotas) — incluindo depois da correção do bug de `findUserIdByEmail`.

**Enviado à Vercel e confirmado em produção em 2026-07-17** (ver §5.5) — o cliente testou `/admin` com a própria conta real depois do deploy e confirmou acesso funcionando.

### 5.5 Fase 6 — Admin em produção + Markdown do LinkedIn + Currículo com IA v3 (2026-07-17)

Rodada com 3 frentes concorrentes, nessa ordem de execução: (1) deploy do painel admin + investigação do bug de redirect relatado, (2) correção de renderização de markdown na Análise de LinkedIn, (3) reformulação completa do Currículo com IA em torno de um "perfil base" reutilizável.

#### 5.5.1 Bug "`/admin` redirecionando pra home com a conta real" — investigado e resolvido

- **Causa raiz**: a linha do owner real em `admin_users` (ver §5.3 item 10) foi inserida **depois** do primeiro teste de login que o cliente fez — nesse teste inicial, `requireAdmin()` corretamente não encontrava nenhuma linha e redirecionava. Não era RLS bloqueando a conta real, nem cookie de sessão obsoleto.
- **Correção defensiva feita mesmo assim** (`src/lib/admin/auth.ts`): a query de `admin_users` dentro de `requireAdmin()` não checava o campo `error` do retorno do Supabase — um erro real de query (ex: RLS mal configurada, coluna renomeada) era tratado silenciosamente como "não é admin" e redirecionava sem nenhum log. Agora o `error` é desestruturado e logado antes de decidir o redirect, então uma falha real de query fica visível nos logs da Vercel em vez de se disfarçar de "acesso negado".
- **Deploy e confirmação**: painel admin (Fase 5, nunca antes enviado à Vercel) deployado em produção nesta rodada. O cliente logou com a conta real (`andre.caval.17@hotmail.com`) e confirmou `/admin` carregando corretamente. Item fechado — nenhuma outra ação pendente.

#### 5.5.2 Análise de LinkedIn — markdown cru virando renderização de verdade

- **Sintoma**: o resultado da análise de IA (`/painel/linkedin`) aparecia na tela como texto solto com `**negrito**`, `#### título` etc. literais, em vez de formatado — a IA sempre respondeu em markdown (esperado, dado o prompt), mas a UI só fazia `<p className="whitespace-pre-wrap">`, sem interpretar a sintaxe.
- **Correção**: instalado `react-markdown`; criado `src/components/ui/ai-markdown.tsx`, um wrapper com `components` mapeando cada elemento markdown (h1–h3, p, strong, em, listas, links, hr, code, blockquote) para classes Tailwind do design system (`text-fg`, `text-fg-muted`, `text-accent-600 dark:text-accent-400`, `font-display`, escala `text-heading-*`/`text-body-*`) — não usa `@tailwindcss/typography` (o projeto não tinha o plugin instalado, e o design system já tem tokens próprios de tipografia). Trocado em `linkedin-form.tsx`: `<AiMarkdown content={analysisToShow} />` no lugar do `<p>` antigo.
- **Evidência**: **verificação por DOM/JS**, não screenshot — a ferramenta de captura de tela (`computer{action:"screenshot"}`) travou em toda tentativa nesta sessão inteira (todas as páginas, não só essa), confirmado como limitação do ambiente de automação, não do produto (rede, console e estrutura do DOM continuam inspecionáveis normalmente). Confirmado via `document.querySelector`: headings renderizados como `<h3>`/`<h4>` de verdade (com `font-display`), `<strong>` aplicando peso de fonte, listas como `<ul>/<li>`, zero ocorrência literal de `**`/`#`/`` ` `` no texto renderizado.

#### 5.5.3 Currículo com IA v3 — perfil base reutilizável (substitui o fluxo v2 de §5.2.1)

Mudança de escopo pedida pelo cliente: em vez do candidato preencher cargo+descrição de vaga toda vez que quisesse um currículo, ele agora preenche um **perfil base** uma única vez (dados pessoais, experiências, formação, habilidades/idiomas) e reaproveita esse perfil tanto no currículo grátis quanto em cada adaptação paga por vaga.

- **Schema reaproveitado sem alteração** (`src/lib/resume-schema.ts`, `ResumeData`) — decisão deliberada do cliente para não duplicar/divergir a estrutura já usada pelos 4 modelos visuais e pela exportação em PDF. "Idiomas" **não** virou campo separado: por instrução explícita de reaproveitar o schema exatamente como está, idiomas entram como itens do mesmo array `habilidades` (ex: `"Inglês Intermediário"` ao lado de `"Excel avançado"`).
- **Migration `0008_candidate_profile_data.sql`**: adiciona `candidate_profiles.profile_data jsonb` — o perfil base estruturado. Aplicada pelo cliente diretamente (confirmada via query REST retornando a coluna).
- **`/painel/curriculo` virou uma máquina de estados** (`curriculo-workspace.tsx`, Client Component com `view: 'hub' | 'perfil' | 'gratis' | 'adaptar' | 'editor'`), sem rotas novas — mesmo padrão já usado no `resume-workspace.tsx` antigo (agora deletado).
  - **Hub**: card de "Perfil base" (preencher/editar) + card único de ação, condicionado ao plano — Grátis vê "Baixar meu currículo" (preview no modelo Básico), Impulso/Mentoria veem "Adaptar para uma vaga".
  - **Perfil base** (`base-profile-form.tsx`): formulário multi-seção com abas (`Pessoal`/`Experiências`/`Formação`/`Habilidades`), listas dinâmicas de experiência (adicionar, remover, mover pra cima/baixo) e formação (adicionar/remover), campo de tags para habilidades/idiomas (`src/components/ui/tag-input.tsx`, componente novo — chips com Enter/vírgula para adicionar, Backspace para remover o último, clique no X remove qualquer um).
    - **Importar currículo existente**: painel "Já tem um currículo pronto?" com duas entradas — colar texto ou enviar arquivo (PDF via `pdf-parse` já existente, `.docx` via `mammoth`, biblioteca nova, extração pura em JS sem dependência nativa). A IA (`extractProfileFromText`/`extractProfileFromFile` em `profile-actions.ts`) extrai pro mesmo `ResumeData`, com instrução explícita no prompt de **nunca inventar** campo que não esteja no texto original (string/array vazio em vez de invenção) — os dados extraídos populam o formulário como rascunho editável, nunca são salvos direto sem revisão.
    - **"Melhorar com IA"**: botão por campo de texto longo (resumo, descrição de cada experiência) que reescreve com tom mais profissional (`improveResumeText`), com a mesma regra de nunca inventar fatos/números/empresas — só reescreve o que já foi dito.
  - **Fluxo Grátis** (`view: 'gratis'`): abre o `ResumeEditor` direto sobre o `profile_data`, template fixo em "básico", "Salvar alterações" grava de volta em `candidate_profiles.profile_data` (`saveBaseProfile`) — sem geração por IA nesse fluxo, sem vaga associada. Export em PDF idêntico ao já existente (client-side, `@react-pdf/renderer`).
  - **Fluxo pago "Adaptar para vaga"** (`view: 'adaptar'` → `'editor'`): tela separada com **"Título da vaga" em texto livre** (preenchido pelo próprio candidato, não extraído pela IA — mais simples e confiável do que pedir isso num JSON já complexo) + "Descrição da vaga" colada + seletor dos 4 modelos visuais. `generateAdaptedResume` (renomeado de `generateResume`, `actions.ts`) parte do `profile_data` (não mais de campos de texto livre) e do system prompt `RESUME_ADAPT_SYSTEM_PROMPT` — reordena/reescreve com foco na vaga, mas com instrução explícita de nunca inventar experiência/formação que não esteja no perfil base. Depois de gerado, o modelo visual pode ser trocado a qualquer momento (antes ou depois de gerar) sem regenerar — troca é só re-render local do mesmo `ResumeData` num componente de preview diferente.
  - **`ResumeEditor` generalizado**: deixou de receber um `resumeId` fixo com `updateResumeVersion` hardcoded; agora recebe um `onSave(data, templateSlug)` genérico — a mesma tela de edição serve tanto para gravar em `candidate_profiles.profile_data` (fluxo Grátis) quanto em uma linha de `resume_versions` (fluxo pago).
  - **Histórico com miniaturas reais** (`src/components/resume-templates/thumbnail.tsx`, componente novo): em vez de mostrar só texto na lista de "Histórico por vaga", cada item renderiza o componente de preview real do modelo daquela versão (`RESUME_PREVIEW_COMPONENTS[templateSlug]`) escalado a 22% dentro de um container fixo (`transform: scale(0.22)`) — miniatura visual de verdade, sem custo de gerar thumbnail via PDF.
- **Bug real encontrado e corrigido durante o teste**: a extração por IA de um currículo colado com uma seção separada de "Idiomas" (ex: "Inglês Intermediário, Espanhol Básico") descartava os idiomas silenciosamente — só as habilidades separadas por vírgula na mesma linha eram capturadas. Causa: o `EXTRACTION_SYSTEM_PROMPT` não instruía explicitamente a dobrar uma seção de idiomas dentro do array único `habilidades`. Corrigido adicionando essa regra explícita ao prompt; re-testado com o mesmo texto e confirmado que ambos os idiomas passaram a aparecer como tags junto com as habilidades técnicas.
- **`AI_MODELS`** ganhou `resumeExtraction` e `resumeImprove` (ambos `gpt-5.4-mini`, mesmo modelo já usado pelas outras features de currículo).

#### Evidência dos testes (2026-07-17, localhost e depois em produção)

Testado com os dois usuários fictícios já existentes (`teste.fase4.gratis@example.com`, Grátis; `teste.fase4.candidato@example.com`, Mentoria) — senha de teste setada via `PUT /auth/v1/admin/users/{id}` (nunca a senha real de ninguém).

1. **Perfil base**: preenchido do zero pelas abas, incluindo 2 experiências (testado adicionar, mover uma pra cima, remover) e 2 formações; tags de habilidades testadas via digitação + blur (commit) e via clique no X (remoção) — confirmado via `SELECT` direto no Supabase que `profile_data` gravou a estrutura completa e correta.
2. **Importar currículo colado**: texto de currículo fictício colado (incluindo seção "Idiomas" separada) → extração real via OpenAI → dados populados no formulário como rascunho → confirmado visualmente (via DOM) que nada foi salvo até o candidato revisar e clicar "Salvar perfil". Achado e corrigido o bug de idiomas descartados (ver acima), re-testado depois com sucesso.
3. **"Melhorar com IA"**: aplicado num resumo escrito propositalmente informal — texto reescrito de forma mais profissional, mesmos fatos preservados (nenhuma empresa/número novo introduzido).
4. **Fluxo Grátis**: preview no modelo Básico com os dados do perfil, edição de um campo com preview ao vivo, "Salvar alterações" persistido (confirmado via Supabase), PDF baixado e validado por assinatura de bytes (`%PDF-1.3`) — mesmo método de validação das fases anteriores.
5. **Fluxo pago "Adaptar para vaga"**: preenchido título ("Analista de Recrutamento e Seleção Sênior") + descrição de vaga realista + modelo "Moderno" → `generateAdaptedResume` executado (~4s, confirmado via log do servidor) → resultado fiel ao perfil base, com enquadramento voltado à vaga e sem fatos inventados → trocado o modelo já gerado para "Executivo" (confirmado re-render instantâneo, sem nova chamada de IA) → "Salvar alterações" persistido (`template_slug: "executivo"` confirmado via Supabase).
6. **Histórico com miniaturas**: a nova versão apareceu primeiro na lista, renderizada em miniatura real no layout Executivo salvo; as 5 versões antigas da Fase 4 (dados legados, sem perfil base) continuaram renderizando corretamente em seus modelos originais — confirma que `ResumeThumbnail` funciona também sobre dados históricos.
7. `npm run lint` e `npm run build` limpos (34 rotas).
8. **Deploy de produção**: `https://ryze-hr.vercel.app` — build limpo (TypeScript + 34 rotas geradas), verificado depois via Browser pane que a home carrega sem erro de console e que `/painel/curriculo` redireciona corretamente pra `/cadastro` quando não autenticado (comportamento esperado, não um erro).

**Nota sobre limitações de ferramenta nesta sessão** (não são bugs do produto):
- `computer{action:"screenshot"}` travou em 100% das tentativas, em toda página, a sessão inteira — confirmado ambiente/ferramenta, não código (todas as outras vias de verificação — console, rede, DOM, logs de servidor — funcionaram normalmente). Evidência desta rodada é baseada em inspeção de DOM/rede/logs, não em captura visual.
- `computer{action:"key"}` despacha eventos de teclado sintéticos onde `e.key` chega como `"Unidentified"` em vez do valor real (ex: `"Enter"`) — descoberto testando o `TagInput` novo. Não é um bug do componente: instrumentado temporariamente com `console.log` para confirmar, removido depois. Testar Enter-to-commit em campos de tag nesta ferramenta precisa usar o caminho `onBlur` como proxy, não o `keydown`.
- `computer{action:"type"}` nem sempre dispara a cadeia completa de eventos `input` que o React espera — `form_input` (que seta o valor via setter nativo + `dispatchEvent`) provou ser mais confiável para inputs controlados.

### 5.6 Fluxo de entrada do candidato consolidado + login direto pro painel (2026-07-17)

Pedido do cliente: existiam DUAS telas concorrentes de "primeiro contato" — o formulário curto antigo (`/para-candidatos/comecar`, Fase 3) e o "Preencher perfil" completo (novo, Fase 6 — ver §5.5.3). A conta real do cliente caiu na tela antiga ao clicar em "Painel" porque nunca tinha preenchido nenhum formulário — o gate do painel ainda checava a coluna antiga (`full_name`), não o `profile_data` novo. Junto com isso, login também caía sempre na home institucional em vez de ir direto pra área do candidato.

**Perfil base virou o único formulário de entrada:**
- `saveBaseProfile` (`profile-actions.ts`) passou de `update` pra `upsert` — antes exigia que a linha em `candidate_profiles` já existisse (só o antigo `/comecar` a criava); agora cria a linha na primeira vez que o candidato salva o perfil novo, sem depender de mais nada ter rodado antes.
- **Colunas antigas continuam preenchidas em paralelo** (`full_name`, `email`, `phone`, `experience_summary`, `target_role`), derivadas do `profile_data` (`nome`→`full_name`, `resumo`→`experience_summary`, `titulo`→`target_role`, `contato.telefone`→`phone`; `email` sempre é o e-mail da conta, não o do formulário). Decisão deliberada pra não precisar tocar em todo mundo que ainda lê essas colunas direto: saudação do painel, `/admin/candidatos`, `/admin/mentoria`, pré-preenchimento do widget do Cal.com (`/painel/mentoria`) e o contexto da simulação de entrevista (`/api/ai/interview`). Nenhum desses precisou de alteração.
- **Gate do painel** (`/para-candidatos/painel/page.tsx`) trocou de checar `full_name` pra checar `profile_data` — sem perfil, redireciona direto pra `/para-candidatos/painel/curriculo` (não mais pra `/comecar`). Mesma troca em `/painel/mentoria`.
- **`CurriculoWorkspace`** (`curriculo-workspace.tsx`) agora abre direto na aba "Preencher perfil" quando `profileData` chega nulo (`useState<View>(initialProfileData ? "hub" : "perfil")`), em vez de sempre abrir no hub — é isso que faz o candidato "cair direto no formulário" sem precisar de tela intermediária.
- **`/para-candidatos/comecar` foi mantida, não removida** — para não quebrar links antigos (inclusive dentro do próprio app, como `signup-form.tsx`/`painel/mentoria` que apontavam pra ela antes). Reduzida a: quem já tem `candidate_profiles` vê o link do WhatsApp de novo (útil se perdeu o link); quem ainda não tem é redirecionado pro formulário novo em `/painel/curriculo`. `candidate-profile-form.tsx` e o `actions.ts` do formulário curto foram deletados (mortos, sem mais nenhum caller).
- **Liberação do WhatsApp**: `WhatsappCta` (movido pra `src/components/painel/whatsapp-cta.tsx`, compartilhado entre `/comecar` e o workspace do currículo) agora aparece como uma tela própria (`view: "boas-vindas"`) logo após o candidato salvar o perfil pela primeira vez — capturado via `cameInWithoutProfile`, um `useState` inicializado uma vez a partir do valor ORIGINAL da prop `profileData` (não reage a saves seguintes). Edições posteriores do perfil (candidato que já tinha perfil, foi em "Editar perfil") voltam direto pro hub, sem repetir a tela do WhatsApp.

**Login redireciona pro painel do candidato (ou admin):**
- `signIn()` (`login/actions.ts`) checa `admin_users` logo após autenticar (mesma tabela/policy do `requireAdmin()`) e decide o destino: **conta de admin vai direto pra `/admin`**, candidato vai pra `/para-candidatos/painel` (que, sem perfil, encaminha pra `/painel/curriculo`). Decisão deliberada, não só "deixar como estava": a conta de admin/owner não usa a área de candidato no dia a dia, então cair direto em `/admin` economiza um clique toda vez que loga — mesmo raciocínio que motivou mandar o candidato direto pro painel dele.
  - Falha ao consultar `admin_users` (rede, RLS, etc.) **não bloqueia o login** — só faz cair no destino de candidato; só uma falha na autenticação em si (`signInWithPassword`) retorna erro pro usuário.

**Achado durante o teste — rate limit de e-mail do Supabase**: tentar validar o `signUp()` pela UI (não só o redirect pós-cadastro) esbarrou de novo no limite de envio de e-mail de confirmação do tier gratuito (`over_email_send_rate_limit`, já documentado em §7) — não é uma regressão desta rodada, é o mesmo limite batido em testes anteriores. Contornado com o mesmo workaround já estabelecido: conta de teste criada direto via `POST /auth/v1/admin/users` com `email_confirm: true` (não dispara e-mail), e o restante do fluxo (login → perfil → WhatsApp → logout → login) testado normalmente a partir daí — isso cobre exatamente o mesmo destino (`redirect("/para-candidatos/painel/curriculo")`) que o `signUp()` chamaria, só pula o disparo do e-mail de confirmação do Supabase.

#### Evidência do teste (2026-07-17, conta candidata nova `teste.fluxo.novo.zero@example.com`, nunca usada antes)

1. **Login com conta recém-criada, sem perfil nenhum**: `POST /login` → aterrissou direto em `/para-candidatos/painel/curriculo` (confirmado via `location.href`), **não** na home — e a única coisa renderizada foi o formulário novo "Preencher perfil" (abas Dados pessoais/Experiências/Formação/Habilidades e idiomas + "Já tem um currículo pronto?"), sem nenhum resquício do formulário curto antigo.
2. **Preenchimento e salvamento**: nome, título, resumo e telefone preenchidos → "Salvar perfil" → tela "Perfil recebido!" apareceu na hora (com o aviso "O link do grupo é enviado em breve por e-mail", já que `NEXT_PUBLIC_WHATSAPP_GROUP_LINK` está vazio em localhost — mesmo fallback gracioso de sempre).
3. **Sincronia com as colunas antigas**: consultado `candidate_profiles` direto via REST (service_role) — `full_name`, `email`, `phone`, `experience_summary` e `target_role` todos preenchidos corretamente a partir do `profile_data`, confirmando que admin/mentoria/entrevista continuam funcionando sem nenhuma alteração própria.
4. **"Ir para o painel"**: hub carregou com "Olá, Bianca" (primeiro nome extraído do `profile_data.nome`) e os 4 cards de ferramenta, plano Grátis.
5. **Logout → login de novo**: `Sair` → home institucional confirmada (navbar voltou a mostrar "Sou candidato"/"Entrar") → login de novo com a mesma conta → aterrissou direto em `/para-candidatos/painel` (hub), **sem** pedir o perfil de novo e **sem** passar pela home — confirma que a persistência entre sessões funciona.
6. `npm run lint` e `npm run build` limpos (34 rotas, inalterado — nenhuma rota nova ou removida nesta rodada).

**Nota**: a conta de teste `teste.fluxo.novo.zero@example.com` (e a linha correspondente em `candidate_profiles`) foi deixada no banco de propósito, mesma convenção das outras contas fictícias já documentadas em §5.3 item 7 — remover junto das demais antes do lançamento.

**Deployado e confirmado em produção em 2026-07-17**: login com a conta de teste (`teste.fluxo.novo.zero@example.com`, já com perfil) contra `https://ryze-hr.vercel.app` aterrissou direto em `/para-candidatos/painel` ("Olá, Bianca"), sem erros de console.

### 5.7 Bug de upload de PDF em produção + perfil em página única + período estruturado (2026-07-17)

Rodada disparada por um teste real do cliente com print de tela: upload de um currículo PDF de verdade falhava com "Não foi possível ler esse arquivo".

#### 5.7.1 Bug real encontrado e corrigido — dois problemas de produção empilhados, não um

Não havia implementação duplicada de extração de PDF — `extractPdfText()`/`extractDocxText()` (`src/lib/pdf.ts`) sempre foram compartilhadas entre a Análise de LinkedIn e o import do perfil. Mas o diagnóstico inicial (só o `outputFileTracingIncludes`) **não foi suficiente** — só depois de deployar essa primeira correção e testar de verdade com um PDF real em produção (gerado programaticamente com `@react-pdf/renderer` e enviado via upload simulado por `DataTransfer`, já que o candidato não tinha um PDF de teste à mão) é que apareceu um SEGUNDO bug, mascarado pelo primeiro.

**Problema 1 — `outputFileTracingIncludes` não cobria a rota do perfil** (configuração de deploy, não código): `next.config.ts`'s `outputFileTracingIncludes` (força o worker do `pdfjs-dist` a entrar no bundle serverless da Vercel — ver §7) só listava `/para-candidatos/painel/linkedin`. Quando o perfil base ganhou upload de currículo na Fase 6 (§5.5.3), passou a chamar a mesma função, mas ninguém adicionou `/para-candidatos/painel/curriculo` na lista. **Corrigido** adicionando a rota que faltava — necessário, mas não resolveu o bug relatado sozinho.

**Problema 2 — o real culpado: `DOMMatrix is not defined`**. Depois de corrigir o Problema 1 e testar de novo em produção com um PDF real, o upload continuou falhando com a mesma mensagem genérica. Só apareceu a causa de verdade ao adicionar temporariamente o erro completo (`err.message` + stack) na resposta da UI, redeployar e repetir o teste: `ReferenceError: DOMMatrix is not defined`, disparado durante a **avaliação do módulo** de `pdf-parse`/`pdfjs-dist` (não dentro de uma função — em código de nível de módulo que roda assim que o import acontece). `DOMMatrix` é uma API de navegador que o Node.js não tem nativamente; `pdfjs-dist` usa (`SCALE_MATRIX = new DOMMatrix()`, além de `.preMultiplySelf()`/`.invertSelf()`/`.multiplySelf()` chamados na extração de geometria de texto) mesmo sem nenhum canvas/renderização de verdade envolvida.
- **Por que só em produção, nunca em `localhost`**: confirmado empiricamente — o MESMO PDF, com o MESMO código, extraído com sucesso via script Node isolado e via `npm run dev` local, mas falhando consistentemente no bundle de produção da Vercel. A explicação mais provável é que o bundling de produção do Turbopack (mais agressivo em mesclar/tree-shakear módulos) acaba avaliando um submódulo do pdfjs-dist que o modo de desenvolvimento mantém sem necessidade de carregar para uma simples extração de texto — mas a causa exata do bundling é secundária; o que importa é que o `ReferenceError` é 100% determinístico em produção com esse PDF.
- **Corrigido**: novo `src/lib/dommatrix-polyfill.ts` — instala `globalThis.DOMMatrix` usando o pacote `@thednp/dommatrix` (shim puro em JS, sem dependência nativa) ANTES do primeiro `import("pdf-parse")` dentro de `ensureWorkerConfigured()`. Esse pacote cobre a maior parte do spec 2D mas não implementa `invertSelf`/`preMultiplySelf` (métodos que o pdfjs-dist chama direto) — completados no polyfill via matemática de matriz afim 2D padrão (inversão por determinante, pré-multiplicação) em cima das propriedades `a/b/c/d/e/f` que o pacote já expõe.
- **Validação da matemática do polyfill**: testado localmente forçando `globalThis.DOMMatrix` a ficar `undefined` antes da extração (para forçar o polyfill a instalar e ser exercitado de verdade) — texto extraído ficou idêntico ao esperado, sem corrupção geométrica.
- **Limitação de verificação deste tipo de bug**: como o sintoma só se manifesta no bundle de produção, testar em `localhost` nunca teria pego isso — e mesmo a primeira correção (Problema 1), sozinha, parecia razoável e plausível o suficiente pra ser confundida com "o" fix. A lição registrada aqui: depois de corrigir um bug reportado só com evidência de produção, **sempre reproduzir de novo em produção antes de declarar resolvido** — não assumir que a causa mais óbvia/já documentada (o `outputFileTracingIncludes`, que já tinha um precedente conhecido) é a única.

#### 5.7.2 Perfil base virou uma página única, sem abas

Pedido do cliente: eliminar a navegação em abas (Dados pessoais/Experiências/Formação/Habilidades) e consolidar tudo em rolagem contínua, na ordem: importar (topo) → dados pessoais + resumo → experiências → formação → habilidades → idiomas → pré-visualização ao vivo ao lado.

- `base-profile-form.tsx` reescrito: removido o estado `section`/`SECTIONS` e a navegação por abas; todas as seções agora renderizam em sequência na coluna esquerda, com uma coluna direita `lg:sticky` mostrando `RESUME_PREVIEW_COMPONENTS.basico` atualizando a cada tecla — mesmo padrão de duas colunas já usado (e aprovado) em `resume-editor.tsx`.
- `resume-editor.tsx` (usado tanto no fluxo Grátis quanto no editor de versões pagas) ganhou o mesmo tratamento de habilidades/idiomas e período que o perfil base, pra não divergir visualmente entre as duas telas que editam o mesmo tipo de dado.

#### 5.7.3 Schema: período estruturado (mês/ano + "Atual") e idiomas separados de habilidades

- **`ResumePeriod`** (`src/lib/resume-schema.ts`): `{ inicioMes, inicioAno, fimMes, fimAno, atual }` substitui o antigo `periodo: string` em `ResumeExperience`/`ResumeEducation`. Novo componente `PeriodFields` (`period-fields.tsx`, compartilhado entre perfil base e editor pago) renderiza dois seletores de mês (`<Select>`) + dois campos de ano + um checkbox "Atual" que desabilita e limpa os campos de fim quando marcado. `formatPeriod()` formata pra exibição (ex: "Mar/2022 – Atual", "Jan/2019 – Fev/2022") — usado pelos 4 modelos visuais (`preview.tsx` e `pdf.tsx`) no lugar do texto livre antigo.
- **Dados legados**: `normalizeResumeData()` tolera o formato antigo — se `periodo` não vier como objeto (ex: uma string salva antes desta mudança), volta pro período vazio em vez de tentar adivinhar mês/ano. Nenhuma migration de banco foi necessária (a coluna é `jsonb`, sem schema fixo) — só o código de normalização mudou.
- **`idiomas: string[]`** virou campo próprio em `ResumeData`, separado de `habilidades` — reverte a decisão da rodada anterior (§5.5.3) de dobrar idiomas dentro de `habilidades`, por pedido explícito do cliente de ter os dois como tags distintas. Os 4 modelos visuais (preview + PDF) ganharam uma seção "Idiomas" própria.
- **Prompts de IA atualizados** (`EXTRACTION_SYSTEM_PROMPT` em `profile-actions.ts`, `RESUME_ADAPT_SYSTEM_PROMPT` em `actions.ts`): especificam o novo formato de `periodo` (objeto, não string) e a separação `habilidades`/`idiomas`, com instrução explícita de nunca inventar mês/ano que não esteja no texto original e marcar `"atual": true` quando o texto disser "atual"/"presente"/"em andamento".

#### 5.7.4 Achado real: "Melhorar com IA" no perfil base não era exclusivo dos planos pagos

O cliente pediu só uma confirmação de que esse gate já existia — mas investigando o código, `base-profile-form.tsx` não recebia `isPaid` como prop e `improveResumeText` (`profile-actions.ts`) não checava plano nenhum no servidor: o recurso estava disponível pra qualquer plano, inclusive Grátis. Corrigido dos dois lados, seguindo o padrão já usado em `analyzeLinkedin`/`generateAdaptedResume`:
- **Frontend**: `BaseProfileForm` agora recebe `isPaid`; quando `false`, os botões "Melhorar com IA" (resumo e cada experiência) viram um badge com ícone de cadeado ("Melhorar com IA · Impulso+") em vez de um botão clicável.
- **Backend**: `improveResumeText()` agora chama `getCurrentUserPlan()` e recusa (`"Melhorar com IA é um recurso dos planos Impulso e Mentoria."`) se o plano não for `impulso`/`mentoria` — não confia só na UI escondendo o botão, mesmo princípio de "controle de acesso em profundidade" já documentado em §5.2.

#### 5.7.5 Conta de teste nova com assinatura Mentoria fictícia

O owner só conseguia testar o plano Grátis com a própria conta real (nunca teve assinatura paga, e não fazia sentido forçar uma fictícia nela). Criada uma conta separada, via `service_role` (mesmo padrão de contas de teste já usado nas fases anteriores):

- **E-mail**: `teste.mentoria.pago@example.com`
- **Senha**: `TesteMentoriaPago!2026`
- Conta criada com `email_confirm: true` (não dispara e-mail) + uma linha em `subscriptions` com `plan: 'mentoria'`, `status: 'active'`, `stripe_customer_id`/`stripe_subscription_id` fictícios (`cus_test_mentoria_...`/`sub_test_mentoria_...`) e `current_period_end` 30 dias no futuro — não é uma assinatura Stripe real, só o suficiente pra `getCurrentUserPlan()` reconhecer o plano Mentoria.
- **Sem perfil pré-preenchido de propósito**: a conta começa sem `candidate_profiles`, pra você experimentar o fluxo completo do zero (login → cai direto no formulário → preenche → libera WhatsApp → painel com os 4 recursos liberados) exatamente como um candidato pagante real veria.

#### Evidência do teste ponta a ponta (2026-07-17, localhost)

1. **Login com a conta Mentoria nova**: aterrissou direto em `/para-candidatos/painel/curriculo`, página única (sem abas), na ordem pedida — confirmado por inspeção de DOM/texto da página.
2. **Import por texto colado**: currículo fictício com dois empregos (um "até o momento", outro com data de término explícita), formação com datas, seção de habilidades e seção de idiomas separada → extração real via OpenAI → resultado conferido campo a campo via `SELECT` direto no Supabase:
   - `experiencias[0].periodo`: `{ inicioMes: "03", inicioAno: "2022", atual: true, fimMes: "", fimAno: "" }` — "até o momento" corretamente virou `atual: true`, sem inventar data de fim.
   - `experiencias[1].periodo`: `{ inicioMes: "01", inicioAno: "2019", fimMes: "02", fimAno: "2022", atual: false }` — mês e ano corretos dos dois lados.
   - `habilidades`: 4 itens técnicos; `idiomas`: 2 itens ("Inglês Avançado", "Espanhol Intermediário") — nenhum idioma vazou pra `habilidades` nem vice-versa.
3. **Pré-visualização ao vivo**: refletiu os dados extraídos imediatamente após a extração (sem precisar salvar primeiro), incluindo as datas formatadas ("Mar/2022 – Atual", "Jan/2019 – Fev/2022") e as seções "Habilidades"/"Idiomas" separadas.
4. **Salvar perfil**: primeira vez salvando → tela "Perfil recebido!" (liberação do WhatsApp) apareceu, confirmando que o gate de liberação (§5.6) continua funcionando com o schema novo.
5. **Painel**: "Olá, Rafael", badge "Plano Mentoria", os 4 cards de ferramenta liberados (nenhum "Impulso+"/"Mentoria" bloqueado).
6. **"Melhorar com IA" — gate por plano**: testado nos dois planos. Conta Mentoria mostrou o botão ativo (clicável); a conta Grátis de teste (`teste.fluxo.novo.zero@example.com`, já usada em §5.6) mostrou o badge travado "Melhorar com IA · Impulso+" no lugar do botão — confirma a correção do achado do §5.7.4 nos dois lados (front mostra cadeado, back recusaria mesmo se chamado direto).
7. **Adaptar para vaga**: template "Moderno" selecionado, vaga fictícia ("Coordenador de Recursos Humanos") preenchida → `generateAdaptedResume` gerou um currículo fiel ao perfil base (mesmas datas, mesmos fatos, reescrita focada na vaga) → troca pra template "Executivo" sem regenerar (confirmado: apenas re-render) → "Salvar alterações" persistido.
8. **Exportação em PDF**: interceptado `URL.createObjectURL` — blob de 3863 bytes, `%PDF-1.3` no header, `type: application/pdf` — PDF válido gerado a partir do template Executivo com os campos de período/idiomas novos, sem erro no react-pdf.
9. **Pré-preenchimento do Cal.com continua funcionando**: `/painel/mentoria` carregou o embed com `name=Rafael+Teste+Mentoria&email=teste.mentoria.pago%40example.com` corretos na URL do iframe — confirma que a sincronia de `full_name`/`email` nas colunas antigas (§5.6) segue funcionando com o `saveBaseProfile` já ajustado pro schema novo.
10. `npm run lint` e `npm run build` limpos (34 rotas, TypeScript passou de primeira em todos os arquivos tocados: schema, 2 templates visuais, editor, formulário de perfil, prompts).

**Nota sobre ferramenta de captura de tela**: tentativas novas de `computer{action:"screenshot"}` nesta rodada (a pedido do cliente, "tentando de novo") voltaram a travar — mesma limitação de ambiente já documentada nas rodadas anteriores. Evidência acima é por inspeção de DOM/rede/logs de servidor/consulta direta ao Supabase, não captura visual.

#### Evidência do bug de PDF corrigido de verdade em produção (2026-07-17)

Depois do primeiro deploy (só com o Problema 1 corrigido — ver §5.7.1), testei em produção com um PDF real gerado programaticamente (texto embutido de verdade, não imagem) e reproduzi a falha de novo — confirmando que a causa completa ainda não tinha sido corrigida. Root-caused o Problema 2 (`DOMMatrix`) via um deploy de diagnóstico temporário (mensagem de erro completa exposta na UI só durante o teste, revertida depois), corrigido com `dommatrix-polyfill.ts`, e testado de novo:

1. **Mesmo PDF, mesma conta, produção**: upload do PDF que antes falhava duas vezes seguidas (com o erro genérico e depois com `DOMMatrix is not defined` exposto) → depois do fix → "Dados preenchidos pela IA" apareceu, todos os campos corretos (nome, título, resumo, experiência com período `Jan/2020 – Atual`, formação `2016 – 2019`, habilidades e idiomas separados corretamente).
2. Console do navegador sem erros.
3. `npm run lint` e `npm run build` limpos depois da correção final (34 rotas).

#### Sobre o processo desta investigação (transparência)

O primeiro deploy desta seção foi anunciado como "corrigido" com base só no Problema 1 — que era um bug real e válido, mas não era a causa completa. Só ficou claro que faltava mais depois de testar de novo em produção com um PDF de verdade (a pedido explícito do usuário, que insistiu em confirmação real e não apenas teórica). Isso reforça a prática já registrada em outras partes deste documento: bugs que só se manifestam em produção exigem reprodução em produção antes de declarar "resolvido", não só a correção mais óbvia/plausível.

### 5.8 Refinamento visual dos currículos + reordenação do fluxo + botões de voltar + entrevista (2026-07-17)

Rodada de feedback de uso real (sem bugs de infraestrutura desta vez — só qualidade de produto).

#### 5.8.1 Qualidade visual dos 4 modelos de currículo

Os 4 templates (`src/components/resume-templates/pdf.tsx` e `preview.tsx`, mantidos em espelho) foram redesenhados com:
- **Controle de quebra de página**: todo bloco de item (uma experiência, uma formação, um grupo de habilidades/idiomas) agora usa `wrap={false}` no react-pdf — o item inteiro pula pra próxima página em vez de ser cortado no meio. Testado com um perfil real de 8 experiências + doutorado (PDF de teste do próprio cliente) — o PDF gerado ficou com 2 páginas, sem nenhum item cortado ao meio (confirmado pela estrutura `/Count 2` no PDF e pela ausência de erro no react-pdf).
- **Escala de espaçamento consistente**: mesma progressão de `marginTop`/`marginBottom` reaproveitada nos 4 modelos (seção → item → sub-elementos), em vez de valores ad-hoc por template.
- **Hierarquia tipográfica mais forte**: título de seção (uppercase, cor accent, letter-spacing) claramente maior/mais destacado que o título do item (cargo/curso, bold), que por sua vez se distingue do subtítulo (empresa/período, menor, itálico, cor muted) e do corpo (peso normal). Confirmado via inspeção de estilo computado no preview ao vivo: título de seção principal 11px/bold/uppercase/cor accent, cargo 12.5px/bold, empresa+período 10.5px/itálico/muted, descrição 12px/normal — quatro níveis visuais distintos, não só no código-fonte mas de fato renderizados.
- **Layout ATS-friendly**: Básico continua uma coluna limpa (sem cor, tradicional). **Executivo e Criativo foram redesenhados de "uma coluna com banner" para duas colunas** (cabeçalho/banner de largura total + corpo dividido em coluna principal ~63% com resumo/experiência e coluna lateral ~37% com formação/habilidades/idiomas) — mesmo princípio estrutural do Moderno (que já era 2 colunas), mas cada um preservando sua identidade visual própria: Executivo com cabeçalho escuro sólido + coluna lateral cinza-claro neutra; Criativo com banner na cor de destaque da marca + coluna lateral com um tom clarinho da mesma cor (`#fbf0ea`). Confirmado via estilo computado que as 3 larguras de coluna e as 2 cores de fundo são realmente distintas entre os modelos, não só visualmente parecidas.

**Bug real encontrado e corrigido no mesmo dia — retângulo vazio na coluna lateral em currículos de várias páginas.** O usuário testou com o próprio perfil real (8 experiências + doutorado) e mandou print: nas páginas 2+ (onde a coluna principal continua, mas a coluna lateral já tinha esgotado seu conteúdo na página 1), a coluna lateral aparecia como um retângulo vazio da cor de fundo, ocupando a altura inteira da página, sem nenhum conteúdo dentro.
- **Causa raiz**: `flexDirection: "row"` em containers do react-pdf usa o default do Yoga (motor de layout) pra `alignItems`, que é `"stretch"` — igual ao CSS flexbox. Quando a coluna principal continua numa página seguinte mas a lateral não tem mais nada pra mostrar, o Yoga ainda estica a coluna lateral (vazia) pra igualar a altura da coluna principal NAQUELA página, e o `backgroundColor` da coluna preenche essa altura esticada inteira — dando exatamente o retângulo vazio do print.
- **Corrigido**: `alignItems: "flex-start"` adicionado em `modernoStyles.page`, `executivoStyles.body` e `criativoStyles.body` (os 3 containers `flexDirection: "row"`) — cada coluna passa a ocupar só a altura do que realmente tem pra mostrar naquela página, em vez de esticar pra igualar a irmã.
- **Verificado com o próprio PDF do bug, não só teoricamente**: regerado o mesmo currículo (mesmo perfil de 8 experiências) depois do fix, e inspecionadas as operações de desenho reais do PDF via `pdfjs-dist` (`page.getOperatorList()`, o mesmo pacote já usado pra extração de texto no projeto) — antes do fix não foi possível reproduzir isso num script isolado (o bug já tinha sido corrigido antes de eu automatizar a verificação), mas a inspeção pós-fix confirma que a página 2 não contém mais nenhuma forma preenchida grande (nenhum retângulo de fundo "órfão") — só a página 1 tem uma forma grande, que é o cabeçalho de largura total (595pt × 110pt), exatamente o esperado. `npm run lint` e `npm run build` limpos depois da correção.

#### 5.8.2 Fluxo "Adaptar para vaga" — modelo só depois de gerar

`curriculo-workspace.tsx`: removido o seletor de modelo da tela inicial (onde ele aparecia sem nenhum preview pra mostrar, então a escolha era às cegas) — agora a tela pede só título + descrição da vaga, gera com um modelo padrão razoável (`moderno`) e leva direto pro editor, onde o seletor de modelo já existia com preview ao vivo — o candidato troca de modelo vendo o resultado real, sem regenerar.

#### 5.8.3 Botão "Voltar ao painel"

Novo componente compartilhado `src/components/painel/back-to-panel.tsx` (link com ícone `ArrowLeft`, mesmo padrão visual do resto do site), adicionado no topo de `/painel/curriculo` e `/painel/linkedin` — essas duas páginas não tinham nenhum atalho direto de volta ao painel além do link "Painel" da navbar.

#### 5.8.4 Simulação de entrevista — contexto de vaga + correção do corte de áudio

- **Campo "Para qual vaga você quer treinar?"**: novo campo opcional na tela inicial de `interview-chat.tsx`, enviado em toda chamada à API (`jobContext`, mais simples que persistir num campo novo em `interview_sessions` já que o componente já mantém esse estado localmente). `src/app/api/ai/interview/route.ts` prioriza esse valor sobre o `target_role` genérico salvo no perfil base ao montar o prompt do entrevistador — perguntas ficam direcionadas pra vaga específica que o candidato quer treinar naquela sessão, não só pro cargo-alvo geral do perfil.
- **Bug real corrigido — gravação cortando sozinha por detecção de silêncio nativa**: causa raiz era `recognition.continuous = false` — o reconhecimento de voz do navegador encerra sozinho na primeira pausa natural da fala (não é preciso silêncio longo). Corrigido em duas partes:
  1. `continuous: true` + `interimResults: true`, acumulando os trechos **finais** reconhecidos (`result.isFinal`) num `ref` ao longo da gravação, em vez de enviar a resposta assim que o primeiro resultado chega.
  2. Se o reconhecimento terminar sozinho (`onend`) **sem** o candidato ter clicado em "Parar gravação" (rastreado via `stoppedByUserRef`), o código chama `recognition.start()` de novo automaticamente, retomando a escuta de forma transparente — só finaliza e envia a resposta acumulada quando o candidato realmente clica em "Parar gravação". Erros fatais (permissão negada, sem microfone) continuam interrompendo de vez, com a mensagem específica de cada caso — só os erros transitórios (`no-speech`, `network`, `aborted`) deixam de mostrar erro e passam a confiar no reinício automático do `onend`.
- **Validado com um teste de verdade, não só leitura de código**: como não há microfone real neste ambiente de teste, criei um `SpeechRecognition` mockado no navegador que reproduz exatamente o cenário do bug — resultado final parcial → `onend()` disparado sem o candidato ter clicado em nada (simulando o corte por silêncio) → confirmado que o código reinicia sozinho (`start()` chamado uma segunda vez) **e não envia nada ainda** (zero requisições disparadas) → segundo trecho de fala simulado → clique real em "Parar gravação" → **uma única requisição** disparada, com a mensagem contendo os dois trechos concatenados ("Eu tenho quatorze anos de experiência em Recursos Humanos e hoje lidero times de mais de vinte pessoas") e o `jobContext` correto. Prova direta de que nenhum pedaço da resposta se perde no reinício automático.

#### Evidência dos testes (2026-07-17, localhost, conta `teste.mentoria.pago@example.com` já com perfil real preenchido pelo próprio cliente)

1. **Currículo pago gerado e baixado**: adaptado pra vaga fictícia "Diretor de Gente e Gestão" a partir de um perfil real extenso (8 experiências, doutorado) → PDF baixado e validado (`%PDF-1.3`, 8128 bytes, 2 páginas, nenhum item cortado ao meio).
2. **Hierarquia visual confirmada por inspeção de estilo computado** (não só leitura de código-fonte) nos templates Executivo e Criativo — larguras de coluna (272px/160px ≈ 63/37), cores de fundo distintas por template (header escuro `rgb(46,44,42)` no Executivo, banner laranja `rgb(232,92,42)` + sidebar clarinha `rgb(251,240,234)` no Criativo), 4 níveis tipográficos distintos dentro de cada item.
3. **Nova ordem do fluxo de adaptação**: confirmado que a tela de "Adaptar para uma vaga" mostra só título + descrição, sem seletor de modelo — o seletor só aparece depois de gerar, já na tela de edição com preview ao vivo.
4. **Botões "Voltar ao painel"**: confirmados presentes no topo de `/painel/curriculo` e `/painel/linkedin`.
5. **Entrevista com contexto de vaga**: pergunta de abertura da IA referenciou corretamente "Gente e Gestão" e, na pergunta seguinte, "posição de diretoria" — confirma que o `jobContext` chega no prompt e influencia as perguntas.
6. **Correção do corte de áudio**: testada com um `SpeechRecognition` mockado que reproduz o cenário exato do bug relatado (ver §5.8.4) — reinício automático confirmado, nenhuma resposta parcial enviada/perdida, resposta final corretamente concatenada.
7. `npm run lint` e `npm run build` limpos (34 rotas).

**Nota sobre ferramenta de captura de tela**: não há conversor de PDF-para-imagem disponível neste ambiente (`pdftoppm`/`pymupdf` não instalados) nem Python configurado, e `computer{action:"screenshot"}` continua indisponível nesta sessão — evidência visual acima é por inspeção de **estilo computado real** do preview ao vivo (que usa exatamente os mesmos valores de layout do PDF) e por validação estrutural do PDF baixado (contagem de páginas, tamanho, header), não por captura de tela literal.

**Nota de privacidade**: o teste desta rodada usou o perfil real do próprio cliente (nome, e-mail, telefone, histórico profissional real), já que ele mesmo preencheu a conta de teste Mentoria com seus dados reais para experimentar o produto. O PDF gerado durante o teste (com esses dados) foi mantido só no diretório de scratchpad local durante a inspeção e apagado logo em seguida — nunca publicado ou compartilhado.

### 5.9 Sobreposição nos templates de currículo + entrevista com botão de encerrar e parecer final (2026-07-17)

Nova rodada de feedback de uso real com print anexado — três frentes.

#### 5.9.1 Bug real: texto do LinkedIn sobrepondo a coluna principal no Moderno

**Causa raiz**: `@react-pdf/renderer` não suporta `overflow-wrap`/`word-break` — um "campo" sem espaços (como uma URL do LinkedIn) não quebra linha sozinho, ele simplesmente desenha além da largura do container. Na coluna lateral do Moderno (36% da página), o texto do LinkedIn vazava horizontalmente pra dentro da faixa de x que pertence à coluna principal — e como o bloco "Contato" fica perto do topo da lateral, na mesma altura aproximada do início do "Resumo" na coluna principal, o vazamento aparecia visualmente como sobreposição sobre o começo do texto de Resumo, exatamente como no print do cliente.

**Corrigido** com `breakableText()` (`src/lib/resume-schema.ts`): insere espaços de largura zero (`​`, invisíveis) depois de separadores comuns de URL/e-mail (`/ . - _ @`), dando ao motor de texto do react-pdf pontos de quebra de linha sem alterar o conteúdo visível. Aplicado em `ContactLine` (usado por Básico/Executivo/Criativo) e diretamente nos campos de e-mail/LinkedIn da barra lateral do Moderno, em `pdf.tsx`. No preview HTML (`preview.tsx`), a classe Tailwind `break-words` (`overflow-wrap: break-word`, que o navegador já suporta nativamente) foi adicionada ao `ContactLine` e ao bloco de contato do Moderno, mantendo preview e PDF consistentes.

*Tentativa de melhoria descartada*: uma segunda versão de `breakableText()` também inseria pontos de quebra a cada poucos caracteres (independente de pontuação), na tentativa de deixar a margem direita ainda mais precisa nos templates de coluna única. Testada e **revertida** — o texto passou a ficar posicionado de forma mais irregular e, no pior caso, chegou a **1,28pt da borda real da página** (pior que antes) e voltou a vazar levemente da barra lateral no Moderno. A versão final é só a quebra por pontuação, que ficou mais estável nos testes.

#### 5.9.2 Revisão de margens, espaçamento e quebra de página nos 4 templates

Margens internas e espaçamento entre seções/itens já estavam consistentes desde a rodada anterior (§5.8.1). O que faltava: **títulos de seção órfãos** — quando uma seção (ex: "Experiência") não cabe inteira na página, o título podia ficar sozinho na última linha de uma página enquanto o primeiro item ia pra página seguinte, deixando um cabeçalho "pendurado" sem conteúdo visível abaixo dele.

**Corrigido** com a prop `minPresenceAhead` do react-pdf (confirmada disponível na versão instalada via `node_modules/@react-pdf/types`) — aplicada em todos os títulos de seção dos 4 templates (`Text` com `minPresenceAhead={30..55}`, valor proporcional ao tamanho esperado do título + início do primeiro item). Com isso, se não houver espaço suficiente na página atual para o título **e** uma fração mínima do que vem depois, o motor de layout empurra o título inteiro para a página seguinte em vez de deixá-lo isolado.

#### 5.9.3 Teste de estresse com perfil longo (ponta a ponta, dados fictícios)

Gerado um perfil fictício longo (5 experiências com descrições extensas, 3 formações, 12 habilidades, 3 idiomas, e-mail e LinkedIn artificialmente longos) e renderizado nos 4 templates via `renderToBuffer` do `@react-pdf/renderer` (script Node temporário, apagado ao final). Resultado: Básico/Executivo/Criativo geraram **2 páginas**, Moderno coube em **1 página**.

Verificação **não visual** (screenshot continua indisponível neste ambiente — ver nota de §5.8), via inspeção estrutural do PDF com `pdfjs-dist` (`page.getTextContent()`, que devolve a posição x/y real de cada trecho de texto desenhado):
- **Moderno**: nenhum item de texto da barra lateral (x inicial < 214pt, borda dos 36%) termina além dessa borda em nenhuma página — confirma que o bug de sobreposição está corrigido, inclusive sob um LinkedIn artificialmente mais longo que o do print original do cliente.
- **Todos os templates**: nenhum texto ultrapassa a borda física da página (pior caso: 3,28pt de folga na linha de contato do Executivo/Criativo antes de quebrar — dentro da margem, nunca tocando a borda).
- **Nenhum título de seção órfão** encontrado nos limites de página 1→2 dos templates que geraram 2 páginas (checado via busca pelas strings dos títulos, inclusive em versão maiúscula por causa do `textTransform: uppercase` do Básico).

#### 5.9.4 Entrevista: botão "Encerrar entrevista" + parecer final destacado

- **Botão sempre visível**: "Encerrar entrevista" (`interview-chat.tsx`) aparece ao lado de "Gravar resposta"/"Parar gravação" assim que a simulação começa — o candidato pode encerrar a qualquer momento, não só depois de um número fixo de perguntas.
- **Encerramento determinístico no servidor**: `src/app/api/ai/interview/route.ts` agora calcula `shouldFinish` no backend (`endRequested === true` **ou** `questionsAskedSoFar >= 6`, contando as mensagens `assistant` já no transcript) **antes** de chamar a IA — não depende mais só da IA "seguir a instrução" do prompt de parar sozinha. Quando `shouldFinish` é verdadeiro, o system prompt muda inteiramente para pedir um parecer final estruturado (avaliação geral, pontos fortes, pontos de melhoria, dicas práticas) em vez da próxima pergunta, e a resposta HTTP inclui `finished: true` de forma explícita.
- **Painel visualmente separado**: no cliente, quando `finished: true` chega na resposta, o conteúdo **não** é adicionado à lista de mensagens do chat — vai para um estado `finalAssessment` à parte, renderizado num painel com borda e fundo destacados (`border-accent-500`, ícone, título "Parecer final") acima do histórico da conversa, seguido de um botão "Começar nova entrevista" que reseta todo o estado local.
- **Caso de borda tratado no prompt**: se o candidato encerrar muito cedo (poucas ou nenhuma resposta), o system prompt instrui a IA a reconhecer isso explicitamente em vez de inventar uma avaliação sobre respostas que não existiram — confirmado no teste real (ver evidência abaixo).

#### 5.9.5 Entrevista mostrando markdown cru

Mesma causa e mesma solução do bug já corrigido na Análise de LinkedIn (§5.5): as mensagens da IA (perguntas e agora também o parecer final) são markdown, mas estavam sendo renderizadas como texto puro (`{m.content}`), mostrando `**`/`##`/`-` literalmente na tela. **Corrigido** reaproveitando o componente `AiMarkdown` (`src/components/ui/ai-markdown.tsx`) já existente — trocado `{m.content}` por `<AiMarkdown content={m.content} />` nas mensagens da IA no chat e no painel de parecer final. Como o componente já existia pronto (mapeamento de markdown pros tokens do design system), a troca foi de fato rápida, como o cliente esperava.

#### Evidência dos testes (2026-07-17, localhost, conta `teste.mentoria.pago@example.com`)

1. **PDF de estresse**: ver §5.9.3 — 4 templates gerados com perfil fictício longo, verificados via inspeção estrutural de texto (`pdfjs-dist`), sem sobreposição de coluna e sem título de seção órfão.
2. **Entrevista — encerrar a qualquer momento**: logado na conta de teste, iniciada a simulação, clicado em "Encerrar entrevista" **imediatamente após a pergunta de abertura, antes de qualquer resposta do candidato** (o cenário mais extremo possível). Resultado real da IA (`gpt-5.4-mini`), capturado da página renderizada:
   > "A conversa foi iniciada, mas não houve desenvolvimento suficiente para uma avaliação profunda do desempenho em entrevista. [...] sem respostas adicionais do candidato, não foi possível observar elementos comportamentais, de comunicação ou exemplos práticos [...]"
   
   Confirma que o caso de borda (§5.9.4) funciona na prática, não só na instrução do prompt.
3. **Painel de parecer final estrutural**: inspecionado via árvore de acessibilidade da página (não só o texto visível) — "Parecer final" e "Parecer da entrevista" renderizaram como elementos `heading` reais (não texto solto), seguidos de `heading`s para "Pontos fortes observados"/"Pontos de melhoria"/"Dicas práticas" e `list`/`listitem` estruturados para cada tópico — prova de que o markdown está sendo interpretado de verdade (`AiMarkdown`/`react-markdown`), não só exibido como texto. Nenhum `##`, `**` ou `-` cru apareceu no texto extraído da página.
4. **Painel separado do chat**: confirmado que o painel de parecer aparece **acima** do histórico da conversa, com sua própria borda/título, e que a mensagem de abertura da entrevista continua visível abaixo dele no chat — não substituiu nem se misturou com o histórico.
5. **Reinício**: clicado em "Começar nova entrevista" — confirmado retorno limpo à tela inicial (campo de vaga vazio, botão "Começar entrevista"), sem resíduo do parecer anterior.
6. `npm run lint` e `npm run build` limpos (34 rotas).

**Nota sobre ferramenta de captura de tela**: `computer{action:"screenshot"}` continua indisponível nesta sessão (timeout consistente) — evidência desta rodada é por extração de texto real da página renderizada (`get_page_text`) e por inspeção da árvore de acessibilidade (`read_page`), que expõe a estrutura semântica real do DOM (headings/lists gerados pelo markdown), não uma leitura de código-fonte.

### 5.10 Scroll automático, botão de encerrar na entrevista, bugs reais de PDF, CTA de plano, upgrade direto, LGPD e WhatsApp (2026-07-18)

Rodada de 7 itens de feedback de uso real.

#### 5.10.1 Bug real: página inteira rolando sozinha a cada mensagem

**Causa raiz**: `interview-chat.tsx` chamava `endRef.current?.scrollIntoView({ behavior: "smooth" })` num `<div>` sentinela no fim da lista de mensagens. Sem a opção `block`, o padrão do navegador é `block: "start"` — o que faz o `scrollIntoView` subir por **todos** os ancestrais roláveis (não só o container `overflow-y-auto` do chat) tentando alinhar o topo do elemento ao topo de cada um, incluindo a página inteira. Isso explica o sintoma: toda vez que `messages` mudava (nova pergunta da IA chegando), a página inteira "pulava".

**Corrigido**: trocado por `chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" })`, chamado diretamente no container do chat (agora com `ref` próprio) — `scrollTo` num elemento afeta só aquele elemento, nunca os ancestrais. O `<div>` sentinela foi removido (não é mais necessário).

**Verificado**: com o navegador posicionado manualmente em `scrollY = 250` antes de disparar uma nova mensagem, o valor permaneceu exatamente `250` depois da resposta da IA chegar (confirmado via `window.scrollY`) — antes do fix isso teria sido resetado pela rolagem forçada.

#### 5.10.2 Botão "Voltar ao painel" na Entrevista

Mesmo componente `BackToPanel` já usado em Currículo e LinkedIn, adicionado em `entrevista/page.tsx`.

#### 5.10.3 Bugs reais de PDF — página branca no Criativo e margem errada da página 2+ (Executivo/Moderno)

Desta vez o teste usou o **currículo real e completo** do cliente (7 experiências, 4 formações), buscado direto de `candidate_profiles.profile_data` da conta de teste Mentoria — não um perfil sintético — exatamente como pedido, já que foi isso que expôs os bugs originalmente.

**Causa raiz (confirmada como limitação conhecida do react-pdf, não bug nosso)**: quando um `View` com `flexDirection: "row"` é dividido entre páginas (o corpo de duas colunas dos templates Moderno/Executivo/Criativo), o react-pdf não reaplica o `padding` próprio desse `View` a partir da segunda página do fragmento — só a primeira página do fragmento recebe o padding corretamente. Ver [issue #430](https://github.com/diegomura/react-pdf/issues/430) e [#466](https://github.com/diegomura/react-pdf/issues/466) do repositório oficial: "se uma linha é dividida entre duas páginas, o layout das colunas quebra, com uma página tendo a largura certa e a outra não".

**Corrigido**: o padding vertical que antes vivia em `main`/`sidebar`/`side` foi movido pra própria `Page` (`paddingVertical` na `page`), que o react-pdf **reaplica de verdade em toda página física** — diferente do padding de um `View` fragmentado. Como isso empurraria o cabeçalho/banner (Executivo/Criativo) ou a sidebar colorida (Moderno) pra dentro, sangrando menos que o desenho original, cada um desses elementos recebeu um `marginTop`/`marginVertical` negativo do mesmo valor pra cancelar o padding da página e continuar colado na borda real — só nesses elementos, o resto do conteúdo (que não tinha essa proteção) passa a herdar o padding da página normalmente, inclusive nas páginas de continuação.

- **Verificado com o currículo real**, inspecionando a posição x/y de cada trecho de texto via `pdfjs-dist` (`getTextContent`): antes do fix, o primeiro item da página 2 do Executivo aparecia a **9,89pt** do topo real da página (praticamente colado, contra os 24pt pretendidos); depois do fix, **33,89pt** — dentro do esperado e consistente com a página 1.
- **Página branca do Criativo**: não foi possível reproduzir isolada mesmo antes do fix (nem com o perfil sintético da rodada anterior, nem com o currículo real, renderizando via Node); o PDF real **baixado pela própria UI do navegador** (não um script) também confirmou 2 páginas, `/Count 2` no trailer, nenhuma página vazia — testado antes e depois da correção de margem. Como o bug de página branca é da mesma classe (`flexDirection: "row"` + quebra de página, mesmos issues do react-pdf linkados acima), a correção estrutural acima é a correção mais provável — mas como não reproduzi o sintoma isolado, fica registrado que não há 100% de certeza de que a causa exata era a mesma. Se o problema persistir em produção, precisa de um novo teste com o PDF exato que gerou o bug.

#### 5.10.4 CTA de plano — direto pro cadastro pré-selecionado

`PricingCard` (usado na seção de planos de `/para-candidatos`) já linkava direto pra `/cadastro?plano=X` — o gargalo real era chegar até aquela seção, que fica depois de "como funciona"/"agitação"/depoimentos. Adicionado um atalho direto na própria dobra inicial da Hero ("Já sabe o que quer? Grátis · Impulso · Mentoria"), cada nome linkando direto pra `/cadastro?plano=X` — escolher um plano e cair no cadastro pré-selecionado agora não exige nenhuma rolagem.

#### 5.10.5 Upgrade de plano — checkout direto, não mais pra home

**Causa raiz**: `PlanUpsell` (tela de bloqueio de recurso pago) linkava pra `/para-candidatos#planos`, a página institucional pública — obrigando o candidato já logado a passar de novo pelo funil de marketing.

**Corrigido**: nova rota `/para-candidatos/painel/upgrade` (só pra logado) com os planos pagos acima do atual em destaque, e uma nova Server Action `upgradeToPlan` (`upgrade/actions.ts`) que cria a sessão do Stripe Checkout **pro usuário já existente** — diferente de `cadastro/actions.ts`, que cria uma conta nova do zero. O webhook (`/api/webhooks/stripe`) não precisou de nenhuma mudança: ele já funciona só com `metadata.supabase_user_id`, sem se importar se a sessão veio do cadastro ou do upgrade. `PlanUpsell` agora aponta pra essa rota nova.

**Verificado de ponta a ponta com a conta de teste Grátis**: acessar Entrevista (bloqueado) → "Ver planos e assinar" → cai direto em `/painel/upgrade`, sem passar pela home → tentativa de assinar sem marcar o checkbox de termos é bloqueada (ver §5.10.6) → marcado o checkbox e clicado "Assinar Impulso" → **redirecionado de verdade pro Stripe Checkout** (`checkout.stripe.com`), confirmando que a sessão foi criada com sucesso pra conta já existente. Pagamento não foi concluído (não é papel do agente completar transações financeiras).

#### 5.10.6 Termos de Uso, Política de Privacidade e checkboxes de consentimento

Duas páginas novas, `/termos` e `/privacidade`, com aviso bem visível no topo ("⚠️ RASCUNHO — revisar com advogado..."). Conteúdo cobre, na Política de Privacidade: quais dados são coletados (perfil, currículo gerado, PDF do LinkedIn, transcrição de entrevista, dados de pagamento via Stripe), finalidade do tratamento, uso de IA de terceiros (seção dedicada citando OpenAI) para processar currículo/LinkedIn/entrevista, base legal, direitos do titular (art. 18 LGPD), tempo de retenção e contato do controlador — com placeholders `[a preencher]` pra CNPJ/razão social/DPO, que só o cliente pode fornecer. Linkadas também no rodapé do site.

Checkbox de consentimento (`required`, **não pré-marcado**) adicionado em dois pontos, ambos validados no servidor além do `required` do HTML (nunca confiar só no client):
- `cadastro/signup-form.tsx` — `signUp()` em `cadastro/actions.ts` agora rejeita o submit se `terms` não vier marcado.
- `painel/upgrade/page.tsx` — cada plano tem seu próprio formulário com o checkbox; `upgradeToPlan()` rejeita se `acceptedTerms` não vier marcado.

**Verificado**: tentativa de "Assinar Impulso" sem marcar o checkbox não navega pra lugar nenhum (bloqueio nativo do HTML, `required` confirmado via JS); com o checkbox marcado, o fluxo completa normalmente (ver evidência em §5.10.5).

#### 5.10.7 Botão flutuante de WhatsApp

Novo componente `WhatsappButton` (`components/layout/whatsapp-button.tsx`), com um ícone desenhado à mão no mesmo estilo dos outros ícones de rede social do projeto (`social-icons.tsx`, já que o lucide-react não inclui ícones de marca). Fixo no canto inferior direito (`position: fixed`, `z-50`), presente em todas as páginas via `layout.tsx`. Linka pra `https://wa.me/5527988881302` com a mensagem pré-preenchida "Olá, preciso de ajuda com o site da Ryze" (URL-encoded). Confirmado presente e com o `href` correto em várias páginas testadas (entrevista, `/para-candidatos`, `/login`).

#### Evidência dos testes (2026-07-18, localhost)

1. **Scroll**: `window.scrollY` permaneceu fixo em 250 depois de uma resposta da IA chegar na entrevista — confirmado via JS, não só visualmente.
2. **Voltar ao painel**: link presente na página de entrevista.
3. **PDF com currículo real**: gerados os 4 modelos a partir do `profile_data` real salvo no banco (não sintético) e inspecionados estruturalmente com `pdfjs-dist` — margem da página 2+ corrigida no Executivo/Moderno (confirmado por posição x/y do texto); Criativo com 2 páginas, sem página vazia, tanto via script Node quanto via **download real pela UI do navegador** (blob capturado por interceptação de `URL.createObjectURL`).
4. **CTA de plano**: clicado no atalho "Mentoria" da Hero de `/para-candidatos` — caiu direto em `/cadastro` com "Mentoria · R$ 49,90/mês" pré-selecionado, sem rolar a página.
5. **Upgrade direto pro checkout**: fluxo completo com a conta de teste Grátis, terminando num redirecionamento real e confirmado pro Stripe Checkout (`checkout.stripe.com`).
6. **Checkbox obrigatório**: tentativa de submit sem marcar bloqueada nativamente; `checked: false` e `required: true` confirmados via JS antes de marcar.
7. **Termos/Privacidade**: as duas páginas renderizam com o aviso de rascunho, linkadas no cadastro, no upgrade e no rodapé.
8. **WhatsApp**: botão presente e com link correto (`wa.me/5527988881302`, mensagem pré-preenchida) em todas as páginas verificadas.
9. `npm run lint` e `npm run build` limpos (37 rotas, incluindo as 3 novas: `/painel/upgrade`, `/termos`, `/privacidade`).

**Nota de privacidade**: o teste do item 3 usou o `profile_data` real do próprio cliente (já salvo no banco de uma rodada anterior, com consentimento de uso pra testes). Os PDFs e o JSON gerados durante a verificação (inclusive um capturado via download real do navegador) foram apagados do diretório de scratchpad imediatamente após a inspeção — nunca publicados ou compartilhados.

### 5.11 Auditoria de scroll, login/cadastro unificados, progresso do perfil e rascunho automático (2026-07-18)

#### 5.11.1 Bug real: "Salvar perfil" jogava a página pro meio/fim da tela

O conserto anterior (§5.10.1) resolveu o `scrollIntoView` da Entrevista, mas o candidato relatou que o problema persistia em outro lugar. Auditoria ampla: busca por `scrollIntoView`/`focus()`/`scrollTo` em todo `src/` não encontrou mais nenhuma chamada explícita de scroll — o bug real era outro mecanismo, sem chamada de scroll nenhuma.

**Causa raiz**: `curriculo-workspace.tsx` alterna entre telas de altura muito diferente (formulário de perfil, ~5000px, vs. resumo curto, ~1200px) trocando um `view` de estado — React desmonta o formulário e monta o resumo. O navegador então **prende o `scrollY` no novo máximo de rolagem** (comportamento padrão, não um bug do site) — se a pessoa estava no meio do formulário longo (`scrollY: 2000`, por exemplo) e a tela nova só tem 1200px de altura, o navegador trava a posição em ~460px, deixando o candidato olhando pro rodapé da tela curta em vez do topo.

**Reproduzido e confirmado**: com o navegador posicionado em `scrollY: 2000` antes de clicar "Salvar perfil", `scrollY` pulou sozinho pra `462` depois (a altura do documento caiu de 5059px pra 1183px no mesmo instante).

**Corrigido**: toda troca de tela em `curriculo-workspace.tsx` agora passa por uma função `changeView()` que troca o estado **e** rola a janela pro topo (`window.scrollTo(0, 0)`) — nenhuma tela nova abre no meio/fim, sempre no topo, como uma navegação de página de verdade. Verificado: mesmo teste (`scrollY: 2000` → "Salvar perfil") agora resulta em `scrollY: 0`.

Outras páginas do fluxo do candidato foram auditadas e não têm esse padrão: a Análise de LinkedIn só acrescenta o resultado abaixo do formulário (nunca substitui/encolhe a tela) e o widget de Mentoria é um iframe do Cal.com com scroll próprio, contido.

#### 5.11.2 Login e cadastro unificados numa tela com abas

`/login` e `/cadastro` continuam existindo como rotas separadas (preserva todo `redirect("/login")`/`redirect("/cadastro?plano=X")` já espalhado pelo código), mas agora renderizam o mesmo componente `AuthTabs` (`src/components/auth/auth-tabs.tsx`), com abas "Entrar"/"Criar conta" — trocar de aba não sai da página, e o `?plano=X` da URL continua pré-selecionando o plano na aba de cadastro.

**Troca automática de aba com e-mail preenchido**:
- **Login → Cadastro**: em qualquer erro de login (senha errada OU conta inexistente — a mensagem do Supabase é propositalmente genérica, não vaza qual dos dois casos é, pra evitar enumeração de e-mails cadastrados), aparece "Ainda não tem conta? Criar conta com esse e-mail", que troca de aba levando o e-mail já digitado.
- **Cadastro → Login**: `signUp()` agora detecta e-mail duplicado nos dois formatos que o Supabase pode devolver (erro explícito "already registered", com confirmação de e-mail desligada — caso deste projeto; ou usuário com `identities: []`, com confirmação ligada) e mostra "Esse e-mail já tem uma conta" com botão "Entrar com esse e-mail", que troca pra aba de login com o e-mail preenchido.

**Testado de ponta a ponta**: login com senha errada pra uma conta real → erro + botão de troca → clicado → aba de cadastro abre com o e-mail certo (confirmado via `document.getElementById('email').value`). No sentido contrário: cadastro com esse mesmo e-mail já existente → "Esse e-mail já tem uma conta na Ryze" → "Entrar com esse e-mail" → aba de login abre com o e-mail certo.

#### 5.11.3 Botão "Entrar" visível no cabeçalho

`navbar-menu.tsx`: link "Entrar" adicionado antes de "Sou candidato" no estado deslogado (desktop e mobile) — quem já tem conta não precisa mais passar pelo funil de candidato pra achar o login.

#### 5.11.4 Indicador de progresso no formulário de perfil

Painel "Progresso do perfil" (barra + checklist de 4 itens: Dados pessoais, Experiências, Formação, Habilidades e idiomas) na coluna de preview de `base-profile-form.tsx` — fica visível durante toda a rolagem do formulário (`lg:sticky`), sem virar wizard: o formulário continua sendo uma página única. Cada item já usa a mesma lógica de "seção preenchida" que faz sentido pro dado (ex: "Dados pessoais" exige nome + pelo menos um contato, não só um campo qualquer). Testado: perfil vazio mostra `0/4`; preencher nome + e-mail atualiza pra `1/4` em tempo real.

#### 5.11.5 Salvamento automático de rascunho

`base-profile-form.tsx` reaproveita o mesmo `saveBaseProfile()` do botão "Salvar perfil" (é um `upsert`, seguro repetir quantas vezes for) — sem chamar `onSaved`, então não troca de tela nem interrompe quem está digitando. Duas camadas:
- **Debounce de 2,5s**: qualquer mudança no formulário agenda um salvamento; mudanças seguidas cancelam e reagendam o timer anterior.
- **`visibilitychange`**: se a aba perder foco (trocar de aba, minimizar, fechar) antes do debounce disparar, salva na hora — mais confiável que `beforeunload` pra garantir que a chamada assíncrona realmente complete.

Indicador textual discreto ("Salvando rascunho..." / "Rascunho salvo automaticamente") ao lado do botão "Salvar perfil", sem duplicar com a confirmação do salvamento manual.

**Testado de ponta a ponta com uma conta vazia**: digitado nome + e-mail fictícios → aguardado o debounce → confirmado o aviso de rascunho salvo → **recarregada a página inteira (equivalente a fechar e reabrir a aba) sem nunca ter clicado em "Salvar perfil"** → o perfil apareceu como "preenchido" e reabrindo o formulário os dois campos digitados continuavam lá, exatamente como digitados.

#### Incidente encontrado durante o teste (dados de teste contaminados) — corrigido

Ao testar o item 5.11.4/5.11.5, o `candidate_profiles` da conta fictícia `teste.candidato.gratis@example.com` apareceu preenchido com nome e telefone **do perfil real do próprio cliente** (idênticos aos de `teste.mentoria.pago@example.com`). Investigação completa e causa raiz confirmada — ver §5.12.

#### Evidência dos testes (2026-07-18, localhost)

1. **Scroll**: `scrollY` fixado em 2000 antes de "Salvar perfil" → `0` depois (era `462` antes da correção) — confirmado via JS em todas as trocas de tela do workspace de currículo.
2. **Login/cadastro unificados**: abas funcionam nos dois sentidos, com e-mail pré-preenchido ao trocar automaticamente a partir de um erro.
3. **Botão Entrar**: confirmado visível no cabeçalho em `/login`, `/para-candidatos` e outras páginas testadas.
4. **Progresso do perfil**: `0/4` num perfil vazio, `1/4` após preencher nome + e-mail, atualização em tempo real confirmada via JS.
5. **Rascunho automático**: sobreviveu a um reload completo da página sem nenhum salvamento manual — confirmado reabrindo o formulário e lendo o valor exato dos campos.
6. `npm run lint` e `npm run build` limpos (37 rotas).

### 5.12 Investigação de segurança: vazamento de dados entre contas — causa raiz confirmada e corrigida (2026-07-18)

O incidente descrito em §5.11 (dados reais do cliente aparecendo na conta fictícia `teste.candidato.gratis`) foi tratado como prioridade máxima a pedido explícito do cliente: **"se a causa for um bug real da aplicação, significa que existe um caminho pelo qual dados de um candidato podem contaminar a conta de outro."** Confirmou-se que sim — é um bug real da aplicação, não um erro de script de teste.

#### Hipóteses descartadas com evidência

**1. Script de teste gravando no user_id/e-mail errado.** Auditados todos os scripts que manipularam `candidate_profiles` neste projeto: o script de criação de `teste.candidato.gratis` faz só `SELECT` (nunca `insert`/`update`/`upsert`) pra confirmar que a conta nasceu vazia; o script que buscou o perfil real de `teste.mentoria.pago` pra gerar PDFs de teste também é só leitura. **Descartada** — nenhum script desta sessão (nem de rodadas anteriores, pelo que ficou registrado no histórico) tem uma chamada de escrita capaz de causar isso.

**2. Bug de sessão mal identificada numa Server Action.** Confirmado via `grep` que `candidate_profiles` só é **escrita** em um único lugar de todo o código: `saveBaseProfile()` (`profile-actions.ts`). Essa função determina em qual linha gravar através de `supabase.auth.getUser()` — ou seja, sempre a partir da sessão verificada na requisição, nunca de um id que o client possa enviar. Isso significa que tecnicamente não dá pra "mandar gravar" na conta de outra pessoa manipulando o formulário — mas também significa que a função **confia cegamente em qual sessão está ativa no momento da chamada**, sem checar se ela é a mesma sessão que carregou os dados que estão sendo enviados. Essa lacuna é exatamente o mecanismo do bug (ver hipótese 3).

**3. Contaminação de sessão entre abas do navegador — CONFIRMADA e reproduzida.** Cookies de sessão são compartilhados entre todas as abas da mesma origem no mesmo navegador — comportamento padrão de qualquer navegador, não uma peculiaridade deste ambiente de teste. Reproduzido de forma controlada e definitiva, usando só contas fictícias descartáveis:

1. Logado como conta A (`teste.candidato.gratis`) numa aba, aberto o formulário de perfil, digitado um texto-marcador no campo Nome — **sem salvar**.
2. Numa aba nova do mesmo navegador, logado como conta B (`teste.repro.bug`, criada só pra este teste). Como o cookie é compartilhado, a sessão do navegador inteiro passa a ser da conta B.
3. Voltado pra aba original (a da conta A) **sem recarregar** — o formulário continua mostrando o texto-marcador digitado.
4. Clicado "Salvar perfil" nessa aba obsoleta.
5. **Resultado**: o texto-marcador foi gravado na conta B, não na conta A — confirmado direto no banco (`updated_at` da conta B mudou, `full_name` = o texto digitado na aba da conta A).

Esse é exatamente o mecanismo do incidente original: uma aba ficou com o formulário de perfil da conta real (`teste.mentoria.pago`) carregado, sem recarregar; em algum momento posterior a sessão do navegador passou a ser `teste.candidato.gratis` (login numa aba diferente ou nova sessão na mesma aba); um salvamento disparado a partir daquele estado obsoleto gravou os dados reais na conta fictícia. Não foi possível reconstituir com 100% de certeza qual ação exata, entre múltiplas rodadas de teste ao longo da sessão, foi o clique/evento específico que disparou esse salvamento — mas isso deixou de importar: **o mecanismo está provado, reproduzido sob controle e agora corrigido na origem**, então não é mais possível que aconteça de novo, seja qual for a sequência de cliques que o cause.

#### Por que isso não é "só um problema do meu teste" — é uma classe real de risco pro produto

O mesmo cenário pode acontecer com candidatos reais: alguém usa um computador compartilhado ou alterna contas na mesma aba/navegador sem recarregar; se uma aba com o formulário de perfil carregado ficar aberta (mesmo em segundo plano) enquanto a sessão do navegador muda de conta, o **rascunho automático novo** (§5.11.5) — que salva sozinho por debounce e ao trocar de aba — tornava esse cenário mais fácil de disparar sem a pessoa perceber, já que não exige mais um clique explícito em "Salvar".

#### Correção aplicada

`saveBaseProfile()` agora recebe também o id do usuário que estava autenticado **quando a página carregou** (capturado no server component, `page.tsx` → `CurriculoWorkspace` → `BaseProfileForm`, nunca em algo que o client possa perder de vista) e **recusa gravar** se a sessão atual não bater com esse id — devolvendo um novo estado `session_mismatch` em vez de escrever silenciosamente. A interface mostra um aviso bem visível ("Outra conta foi acessada em outra aba... recarregue a página") com um botão "Recarregar página", e desabilita o botão "Salvar perfil" nesse estado. Essa checagem cobre os três pontos que chamam `saveBaseProfile` (botão manual, debounce automático, `visibilitychange`). A mesma proteção foi aplicada em `generateAdaptedResume()` (geração de currículo adaptado pra vaga), que tem o mesmo padrão de formulário-com-dados-carregados-antes-do-submit, ainda que com dado menos sensível (título/descrição da vaga, não PII).

**Risco residual conhecido, não corrigido nesta rodada**: `analyzeLinkedin()` (upload do PDF do LinkedIn) tem uma janela de exposição bem menor — o arquivo é selecionado e enviado quase imediatamente, sem estado que fique "parado" por muito tempo — mas o mesmo padrão teórico existe. Fica registrado como item de follow-up, não bloqueante pra este deploy porque a superfície de exposição é muito menor (segundos, não minutos/horas) e o dado (texto de um PDF de LinkedIn já público) é menos sensível que nome/telefone.

#### Verificação da correção (reprodução do exato mesmo ataque, agora bloqueado)

Repetido o passo a passo da reprodução acima, com contas descartáveis novas, contra o código corrigido:
1. Conta `teste.candidato.gratis` com o marcador `MARCADOR_VERIFICACAO_FIX_GRATIS` digitado no Nome, sem salvar.
2. Sessão do navegador trocada pra `teste.repro.fix` (conta nova, só pra este teste) numa aba separada.
3. Voltado pra aba obsoleta (ainda com o marcador, sem recarregar) e clicado "Salvar perfil".
4. **Resultado**: a interface mostrou o aviso "Outra conta foi acessada em outra aba..." com o botão de recarregar — nenhuma gravação aconteceu. Confirmado direto no banco: `teste.repro.fix` continuou com `full_name` vazio; o marcador só existe na própria conta `teste.candidato.gratis` (gravado antes, pelo rascunho automático, enquanto a sessão ainda era dela mesma — comportamento correto).

Todas as contas fictícias criadas só pra esta investigação (`teste.repro.bug`, `teste.repro.fix`) foram apagadas por completo depois do teste; `teste.candidato.gratis` foi restaurada ao estado sem perfil.

#### Veredito sobre segurança do deploy

**Seguro fazer o deploy desta rodada.** A causa raiz do incidente é um bug real da aplicação (não um erro de teste), foi identificada com evidência reproduzível, corrigida na função que efetivamente grava os dados (não só na interface), e a correção foi verificada repetindo o exato ataque que funcionava antes — agora bloqueado. `npm run lint` e `npm run build` seguem limpos depois da correção.

### 5.13 Botão "Voltar ao painel" na Mentoria e correção do aviso de bloqueio de sessão sem texto (2026-07-18)

Duas correções pontuais pedidas pelo cliente numa rodada de feedback de uso real.

#### Item 1 — Botão "Voltar ao painel" faltando em `/painel/mentoria`

A página de agendamento de mentoria (`src/app/para-candidatos/painel/mentoria/page.tsx`) nunca tinha recebido o componente `BackToPanel` já usado em Currículo, LinkedIn e Entrevista (§5.9) — simples descuido na hora de criar a página (Fase Cal.com, antes desse padrão existir). Adicionado o mesmo `<BackToPanel />` + `mt-4` no `<h1>`, seguindo exatamente o padrão das outras três páginas.

**Testado nos três estados possíveis da página** (com conta de teste descartável, plano trocado via API admin do Supabase pra cobrir os três casos, depois revertido):
- Plano Grátis/Impulso (upsell "Sessão de Mentoria é um recurso Mentoria") — botão presente.
- Plano Mentoria, sem sessão agendada no ciclo (widget de agendamento do Cal.com) — botão presente.
- Plano Mentoria, com sessão confirmada no ciclo (tela "Sua sessão está confirmada") — botão presente.

#### Item 2 — Aviso de bloqueio de sessão aparecia sem texto explicativo

**Causa raiz confirmada**: a proteção contra sessão obsoleta (§5.12) foi implementada corretamente em `saveBaseProfile()` e em `BaseProfileForm` (tela "Editar perfil"), incluindo a mensagem completa e o botão "Recarregar página". Mas existe um **segundo caminho** que também chama `saveBaseProfile()`: a tela "Ver e baixar" (plano Grátis), que usa o componente genérico `ResumeEditor` — reaproveitado também pela tela paga "Adaptar para vaga" (que grava em `resume_versions`, não em `candidate_profiles`).

O contrato de `onSave` do `ResumeEditor` (`resume-editor.tsx`) só aceitava `{ status: "idle" | "success" | "error" }` — um tipo mais pobre que o `SaveProfileState` retornado por `saveBaseProfile()` (que inclui `"session_mismatch"` e `message`). Em `curriculo-workspace.tsx`, a tela "gratis" colapsava explicitamente o resultado: `{ status: result.status === "success" ? "success" : "error" }`, descartando tanto o status `session_mismatch` quanto a mensagem. `ResumeEditor` então mostrava só `"Não foi possível salvar."` (span genérico de erro, sem contexto) — exatamente o "bloqueio sem nenhum texto explicativo" relatado.

**Correção**: o tipo de `onSave` em `resume-editor.tsx` passou a aceitar `"session_mismatch"` e `message`; o componente ganhou o mesmo banner usado em `BaseProfileForm` (mensagem completa + botão "Recarregar página") e desabilita "Salvar alterações" nesse estado. Em `curriculo-workspace.tsx`, a tela "gratis" agora repassa o resultado de `saveBaseProfile()` sem colapsar (`return result;`), preservando status e mensagem.

**Verificado com o exato cenário de duas abas** (contas descartáveis `teste.item2a`/`teste.item2b`, apagadas depois do teste), desta vez contra a tela **"Ver e baixar"** (o caminho onde o bug realmente vivia, não a tela "Editar perfil" que já funcionava):
1. Conta A logada, entrou em "Ver e baixar", digitado o marcador `MARCADOR_VERIFICACAO_ITEM2` no campo Nome, sem salvar.
2. Sessão do navegador trocada pra conta B numa aba separada.
3. Voltado pra aba obsoleta (ainda com o marcador) e clicado "Salvar alterações".
4. **Resultado**: apareceu a mensagem completa — *"Sua sessão mudou nesta aba (outra conta foi acessada em outra aba). Recarregue a página antes de salvar, pra não gravar dados na conta errada."* — com o botão "Recarregar página", e o botão "Salvar alterações" ficou desabilitado (confirmado via inspeção do DOM, `disabled: true`). Nenhuma gravação cruzada aconteceu: `candidate_profiles` da conta A manteve seus próprios dados; a conta B só tinha seu próprio perfil vazio (gravado pelo autosave de troca de aba da própria conta B, sessão correta — comportamento esperado, não contaminação).

`npm run lint` e `npm run build` limpos depois das duas correções.

### 5.14 Auditoria de UX (3 planos + checkout) e correção de bug crítico: cobrança dupla no upgrade de plano (2026-07-19)

#### Auditoria de UX

A pedido do cliente, feita uma auditoria crítica (não é caça a bug) da jornada completa do candidato nos três planos — cadastro, primeira tela, preenchimento de perfil, cada ferramenta, navegação — com atenção extra ao fluxo de checkout. Testado com contas descartáveis reais e dois checkouts reais no Stripe em modo teste (não simulado). Principais achados reportados ao cliente (aguardando decisão sobre o que implementar):

- **Rate limit de e-mail do Supabase**: um cadastro real via `signUp()` falhou com `over_email_send_rate_limit` — não há SMTP customizado configurado (`RESEND_API_KEY` vazio), então o projeto depende do serviço de e-mail padrão do Supabase, que tem limites baixos. Risco real sob volume de cadastro.
- **Promessa do grupo de WhatsApp não é entregue**: `NEXT_PUBLIC_WHATSAPP_GROUP_LINK` vazio + sem e-mail transacional configurado — a tela "Perfil recebido!" promete o link "em breve por e-mail", que hoje nunca chega. Já era pendência conhecida (§12), mas é a primeira coisa prometida na home e a primeira que falha.
- **Currículo Grátis**: caminho do login até ver/baixar o currículo tem 9 passos — a tela pós-perfil deveria linkar direto pro currículo, não só pro painel genérico.
- **Impulso perde o caminho simples**: hub de Currículo para plano pago só oferece "Adaptar para vaga" (exige descrição de vaga) — sumiu o "Ver e baixar" simples que o Grátis tem.
- **Qualidade da IA**: um teste de "Adaptar para vaga" com perfil mínimo gerou texto com caractere devanágari solto no meio do português (`"aplicar e विकसितiver sua atuação"`) — condição de borda (perfil quase vazio), mas seria visível no PDF final.
- **Checkout — feedback ausente**: botões "Assinar" em `/painel/upgrade` não têm estado de carregamento (diferente do cadastro, que usa `isPending`) — clique fica sem feedback visual até o redirecionamento pro Stripe.
- **Checkout — nome do vendedor**: a página do Stripe mostra "Área restrita de Ryze" como nome do comerciante (configuração da conta Stripe, não do código) — soa pouco confiável no momento do pagamento.
- **Oferta de upgrade genérica**: tanto o bloqueio de recurso pago quanto `/painel/upgrade` mostram texto idêntico ao da página pública de preços, sem nenhuma referência à ferramenta específica que motivou o upgrade.
- **Mentoria — mensagem de sucesso enganosa**: "Em breve você recebe o convite para agendar sua primeira sessão" — não existe nenhum convite/e-mail associado a assinar Mentoria no código (buscado no projeto inteiro); o agendamento já está disponível na hora, direto em `/painel/mentoria`. Corrigido como consequência indireta do item abaixo (ver nota).

#### Bug crítico: cobrança dupla no upgrade de plano

Durante o checkout de upgrade Impulso → Mentoria, a auditoria acima flagrou o problema mais grave já encontrado no projeto: **o candidato ficava sendo cobrado pelas duas assinaturas ao mesmo tempo** (R$19,90 + R$49,90 = R$69,80/mês em vez de R$49,90), e o painel regredia pra "Plano Grátis" — tudo bloqueado — logo depois de pagar.

**Causa raiz** (três pontos, todos confirmados):
1. `upgradeToPlan()` (`src/app/para-candidatos/painel/upgrade/actions.ts`) sempre criava uma assinatura **nova** no Stripe via Checkout Session, sem nunca cancelar a antiga.
2. O webhook (`upsertSubscription` em `src/app/api/webhooks/stripe/route.ts`) grava por `upsert(..., { onConflict: "stripe_subscription_id" })` — como a assinatura nova tem um id diferente da antiga, isso sempre insere uma linha nova em vez de substituir, deixando duas linhas `active` pro mesmo `user_id`.
3. `getCurrentUserPlan()` (`src/lib/supabase/server.ts`) usava `.maybeSingle()`, que falha quando mais de uma linha bate no filtro — e o código só desestruturava `{ data }`, descartando o `error` silenciosamente. Resultado: a query falhava, ninguém via nada nos logs, e o fallback `?? "gratis"` escondia o problema completo.

**Correção, nos três pontos**:
1. `upgradeToPlan()` agora busca as assinaturas `active` existentes do usuário antes de criar a nova; cancela cada uma no Stripe (`stripe.subscriptions.cancel`) e marca a linha local como `canceled` **na hora**, via service role, sem esperar o webhook — fecha a janela onde as duas ficariam ativas simultaneamente mesmo que o evento do Stripe demore ou chegue fora de ordem. A nova sessão de checkout reaproveita o `stripe_customer_id` da assinatura antiga em vez de deixar o Checkout criar um Customer novo (necessário para o crédito de proração funcionar — ver abaixo).
2. `upsertSubscription()` ganhou uma rede de segurança: sempre que grava uma assinatura `active`, encerra (`canceled`) qualquer outra linha `active` do mesmo `user_id` — cobre qualquer caminho que crie uma segunda assinatura ativa fora do fluxo normal do app (ex: ação manual direta no painel do Stripe). Optou-se por essa lógica em vez de uma constraint de unicidade no banco: uma constraint rígida arriscaria falhar o webhook (e o Stripe reenviar) exatamente durante a janela normal de transição cancelar-então-criar.
3. `getCurrentUserPlan()` não descarta mais o `error` da query — loga explicitamente antes de qualquer fallback — e trocou `.maybeSingle()` por uma query ordenada (`updated_at desc`, `limit(1)`), que nunca quebra mesmo se uma duplicata aparecer: sempre resolve pra linha mais recente.

**Política de proração** (pedida explicitamente: decidir e documentar): cancelamento é **imediato** — nunca duas assinaturas ativas ao mesmo tempo — com **crédito proporcional pelo tempo não usado**. Testadas duas abordagens antes de chegar na correta:
- `prorate`/`invoice_now` no cancelamento: gera um item de crédito amarrado à assinatura **antiga** (agora cancelada) — nunca chega a se aplicar na fatura da assinatura nova, que sai cobrando o preço cheio.
- **Solução usada**: calcular o valor do tempo não usado (proporção do ciclo restante × preço do plano antigo) e lançar como **saldo de crédito no Customer** (`stripe.customers.createBalanceTransaction`), que o Stripe aplica automaticamente na próxima fatura de **qualquer** assinatura desse Customer, sem depender de qual assinatura gerou o crédito.

**Verificação** (reprodução completa do cenário, contra o Stripe em modo teste, com conta descartável apagada depois):
1. Conta nova → Grátis → "Assinar Impulso" (checkout real, cartão de teste 4242) → confirmado Impulso.
2. `/painel/upgrade` → "Quero a Mentoria" (segundo checkout real) → confirmado.
3. **Resultado, checado em três camadas independentes**:
   - Stripe: só 1 assinatura com `status: active` (Mentoria); a de Impulso aparece genuinamente `canceled`.
   - Banco (`subscriptions`): só 1 linha `active`; a antiga virou `canceled`.
   - Painel: mostra "Plano Mentoria" corretamente, tudo desbloqueado — sem regressão pra "Grátis".
   - Fatura da Mentoria: `total` R$49,90, mas `starting_balance` -R$19,90 → `amount_paid` **R$30,00** (não R$49,90 nem R$69,80) — crédito de proração aplicado de verdade, confirmado nos campos da fatura no Stripe.
4. Verificada também a tabela `subscriptions` de produção (mesmo projeto Supabase usado durante toda a sessão) por linhas duplicadas de testes anteriores — nenhuma encontrada; as únicas contas com assinatura `active` são as fictícias já documentadas (`teste.fase4.candidato`, `teste.mentoria.pago`).

`npm run lint` e `npm run build` limpos. Deployado em produção e confirmado no ar (`https://ryze-hr.vercel.app/para-candidatos` respondendo normalmente) logo após o deploy.

### 5.15 Segurança (cookie HttpOnly, headers, RLS) e incidente de CSP quebrando hidratação em produção (2026-07-20)

**Pedido original**: fechar 4 pontos de segurança — (1) cookie de sessão do Supabase sem `HttpOnly`, (2) ausência de headers de segurança (CSP, `X-Frame-Options`, etc.), (3) confirmar que o gating de planos pagos é validado no servidor, (4) confirmar RLS em todas as tabelas.

**Itens 1, 3 e 4 — sem incidente**:
- **HttpOnly**: `@supabase/ssr` usa `httpOnly: false` por padrão de propósito (pensado pra apps que também leem a sessão via `document.cookie` no client). Neste projeto o browser client (`src/lib/supabase/client.ts`) nunca foi importado em lugar nenhum — toda auth é server-side (`getSupabaseServerClient()` + `proxy.ts`). Confirmado seguro habilitar `cookieOptions: { httpOnly: true }` em `server.ts` e `middleware.ts`; `client.ts` removido por ser código morto.
- **Gating server-side**: os três pontos que custam dinheiro de verdade (currículo, LinkedIn, entrevista) já checavam `getCurrentUserPlan()` direto no banco a cada chamada, nunca confiando em `user_metadata` do JWT. Nenhuma correção necessária.
- **RLS**: confirmado **ao vivo em produção** (não só pela migration) comparando a chave anon contra a service role nas 9 tabelas — anon vê 0 linhas em todas, RLS de fato aplicado.

**Item 2 (headers) — quebrou produção, veja o incidente completo**:

Primeira tentativa: CSP estática em `next.config.ts`, com `script-src 'self' 'sha256-<hash-do-script-de-tema>'` — permitindo por hash o único `<script>` inline do **nosso** código (`src/app/layout.tsx`, inicialização do tema antes do primeiro paint). Testada em dev (headers corretos, zero violação de CSP no console, todos os recursos 200 OK) e aprovada pelo cliente. Deployada em produção.

**Resultado real em produção**: dois recursos pagos quebraram silenciosamente — "Adaptar para vaga" (Currículo com IA) não reagia ao clique, e a Simulação de Entrevista mostrava "seu navegador não suporta entrada por voz" mesmo no Chrome. Revertido imediatamente (CSP removida do `next.config.ts`) a pedido do cliente, confirmado por `curl -I` que o header sumiu, e só então investigada a causa raiz.

**Causa raiz**: o Next.js App Router injeta, ele mesmo, vários `<script>` inline no HTML pra entregar o payload de streaming dos Server Components (`self.__next_f.push(...)` — confirmado via `curl` na página real: 18 `<script>` no total, vários com esse padrão). Uma CSP com hash fixo só cobre um script **estático e conhecido de antemão**; os do próprio Next variam a cada request (carregam dados reais da página), então não têm hash possível. Sem `'unsafe-inline'` nem nonce, a CSP bloqueava **todos** os scripts de hidratação do framework — a página inteira ficava sem nenhuma interatividade client-side, sem nenhum erro visível pro candidato (a query de rede continuava 200 OK, só a execução do script é que era barrada pelo browser). Os dois sintomas reportados eram a mesma causa: o botão "Adaptar para vaga" tem um `onClick` que nunca era anexado (React nunca hidratava), e o hook de suporte a voz (`useSyncExternalStore`) ficava preso no valor de fallback do servidor (`false`), que existe justamente pra evitar mismatch de hidratação — e como a hidratação nunca completava, o valor real (`true` no Chrome) nunca substituía o fallback.

Diagnóstico de "meu ambiente de teste também estava com o mesmo problema, e eu atribuí a um limite da ferramenta de browser em vez de investigar" — retrospectiva importante: os sinais já estavam lá antes do deploy (toggle de tema não reagia, `screenshot`/`click` do browser de teste travavam, 0 elementos com chave interna do React em toda a página), mas foram descartados como "renderer travado" em vez de reconhecidos como hidratação genuinamente quebrada. Não confiar cegamente em timeout de ferramenta como explicação — sempre checar `__REACT_DEVTOOLS_GLOBAL_HOOK__`/props internas do React antes de descartar um sintoma de interatividade.

**Correção**: CSP por **nonce**, gerado a cada request em `src/proxy.ts` (não dá pra gerar em `next.config.ts` — precisa ser por request). `script-src 'self' 'nonce-<valor>' 'strict-dynamic'` — o Next.js lê o nonce do header `Content-Security-Policy` da própria response e aplica automaticamente em todos os seus scripts de framework; nosso script de tema em `layout.tsx` recebe o nonce explicitamente via `headers()`. `style-src` continua com `'unsafe-inline'` (necessário: 15+ componentes usam `style={{...}}` do React pra valores dinâmicos — nonce não se aplica a atributos `style`, só a elementos `<script>`/`<style>`). Nonce força renderização dinâmica, mas o site já era 100% dinâmico antes disso (Navbar lê a sessão em toda página — ver §12), então não há custo extra.

**Verificação — cliques reais, não só headers/console** (exigência explícita do cliente após o incidente): logado com `teste.mentoria.pago@example.com` em produção depois do redeploy:
- "Adaptar para vaga": clicado → formulário de título/descrição da vaga abriu corretamente.
- Simulação de Entrevista: "Começar entrevista" clicado → IA respondeu com a primeira pergunta; "Gravar resposta" clicado → disparou o pedido de permissão de microfone do navegador (bloqueado só pelo sandbox da ferramenta de teste, não pelo código) e mostrou a mensagem correta "Permita o acesso ao microfone...".
- Zero violação de CSP no console em nenhuma das duas telas.

`npm run lint` e `npm run build` limpos em cada etapa (antes do deploy inicial, no revert, e na correção final). Três deploys nesta rodada: CSP com hash (quebrou), revert sem CSP (estabilizou), CSP com nonce (correção definitiva, no ar).

### 5.16 Bug do PDF (segunda causa de CSP, diferente da §5.15) + exclusão de currículos adaptados (2026-07-20)

**Bug 1 — "Baixar em PDF" falhando em produção**: reportado depois do deploy da CSP por nonce (§5.15). Investigado sem assumir que era a mesma causa — reproduzido de verdade em produção antes de propor qualquer fix, e o console mostrou o erro exato: `WebAssembly.instantiate(): ... violates ... because 'unsafe-eval' is not an allowed source of script`.

Causa raiz, diferente da §5.15: `@react-pdf/renderer` usa o motor de layout Yoga (Facebook), compilado em **WebAssembly**, pra montar o PDF inteiramente no browser (`resume-editor.tsx`, botão "Baixar em PDF" — não existe geração de PDF no servidor, nem storage nenhum envolvido). Instanciar um módulo WASM exige a palavra-chave `'wasm-unsafe-eval'` na CSP — **não é o mesmo que `'unsafe-eval'`** (que libera `eval()`/`Function()` arbitrário e continua de fora, de propósito). Faltava essa palavra-chave específica no `script-src` de `proxy.ts`.

**Correção**: adicionado `'wasm-unsafe-eval'` ao `script-src`, incondicionalmente (produção e dev) — ver comentário em `src/proxy.ts`.

**Verificação — nível "bytes reais", não só ausência de erro**: interceptado `URL.createObjectURL` em produção antes de clicar em "Baixar em PDF"; o clique gerou um blob real de **7877 bytes, `type: "application/pdf"`**, zero erro no console.

**Bug 2 — exclusão de versões adaptadas (funcionalidade nova)**:
- `resume_versions` tinha policy de RLS pra select/insert/update, mas **nunca teve policy de delete** — candidato não conseguia excluir currículos adaptados antigos. Nova migration: `0009_resume_versions_delete_policy.sql` (aplicada pelo cliente diretamente no SQL Editor do Supabase, mesmo padrão da §5.7/migration 0008 — não tenho acesso a executar DDL, só REST via service role).
- Não existe PDF armazenado em nenhum storage pra limpar — é gerado inteiramente no browser no momento do download (ver Bug 1 acima), então excluir a linha em `resume_versions` já é suficiente.
- `candidate_profiles` (perfil base) é uma tabela separada, sem policy de delete de propósito — a exclusão de uma versão adaptada nunca toca nela. Confirmado na prática: depois de excluir uma versão em produção, o card "Seu perfil base" continuava mostrando "Perfil preenchido" normalmente.
- UI: confirmação inline no próprio card (sem modal — não existe um componente de Dialog no design system ainda, e criar um só pra este caso seria over-engineering) — ícone de lixeira aparece no hover, clique mostra "Excluir a versão X? Essa ação não pode ser desfeita." com Cancelar/Excluir, exclusão real só no segundo clique.

**Verificação de ponta a ponta em produção**: clicado em excluir → confirmado → lista de versões foi de 8 para 7 cards (delete real no banco + `router.refresh()`); perfil base confirmado intacto depois.

`npm run lint` e `npm run build` limpos. Um deploy nesta rodada (CSP + migration de policy + feature de exclusão, tudo junto — mesma área de código, testado em conjunto).

### 5.17 Tela de entrada candidato/empresa + fluxo guiado Currículo → LinkedIn → Entrevista (2026-07-20)

**Tela de entrada**: a home (`/`) misturava público de candidato e de empresa, confundindo quem chegava no site. Virou uma pergunta binária ("Você é candidato ou empresa?", componente novo `src/components/sections/audience-gate.tsx`, reaproveitando o `AudienceCard` que já existia no código mas nunca tinha sido usado). O conteúdo institucional antigo foi **movido** (não recriado) pra `/empresas`, tirando de lá a seção de isca pra candidatos (que já vive em `/para-candidatos` — mantê-la nos dois lugares reproduziria a mesma mistura que estava sendo corrigida). Navbar/footer continuam globais, sem tratamento especial pra rota `/`.

**Fluxo guiado (Opção B, aprovada pelo cliente)** — proposta de estrutura de dados discutida e aprovada antes de codar:
- Nova tabela `job_applications` (migration `0010_job_applications.sql`, aplicada pelo cliente no SQL Editor — sem acesso a DDL) é o "envelope" que amarra as três etapas pra mesma vaga: `resume_version_id`, `linkedin_analysis_id`, `interview_session_id`, todos nullable.
- `linkedin_analyses` **não virou histórico por vaga** de propósito — continua "1 por usuário" (upsert). A análise avalia o perfil, não a vaga; forçar reanálise a cada vaga nova seria trabalho repetido à toa e custo de IA desperdiçado. O Passo 2 do fluxo oferece "usar essa análise ou refazer" em vez de forçar upload novo.
- `interview_sessions` ganhou `job_application_id`, `job_context` (antes só existia como estado do componente no browser — sumia ao recarregar) e `finished`.
- Navegação por `?vaga=<job_application_id>` nas 3 páginas que já existiam (`/painel/curriculo`, `/painel/linkedin`, `/painel/entrevista`) — sem rotas novas. Nasce no momento em que "Adaptar para vaga" é concluído (já coleta título+descrição). Componente novo `src/components/painel/job-flow-progress.tsx` mostra a barra de progresso nas 3 telas; `JobFlowDots` (compacto, em `curriculo-workspace.tsx`) mostra o progresso em cada card do histórico, com link "Continuar fluxo guiado" pro próximo passo pendente.
- Simplificação consciente: o passo "Entrevista" no indicador de progresso marca como concluído assim que uma sessão é **criada** (vinculada à vaga), não quando é **finalizada** — evita uma consulta extra a `interview_sessions.finished` só pra isso. Documentado aqui como possível refinamento futuro, não implementado por não ter sido pedido.

**Verificação de ponta a ponta em produção** (exigência explícita do cliente — clicar em cada etapa, não só ler código):
1. "Adaptar para vaga" gerado de verdade → banner "Currículo pronto! Continue..." apareceu, link pra `/painel/linkedin?vaga=<id>` confirmado.
2. `/painel/linkedin?vaga=`: barra de progresso mostrou o título da vaga certo; como a conta já tinha análise, apareceu a escolha "Usar essa análise / Refazer" — cliquei em reaproveitar, vínculo criado, convite pra Entrevista apareceu.
3. `/painel/entrevista?vaga=`: barra de progresso com Currículo/LinkedIn já marcados, campo "pra qual vaga treinar" **pré-preenchido automaticamente** com o título da vaga; sessão iniciada e vinculada de verdade no banco.
4. De volta ao histórico do Currículo: os 3 pontinhos do card apareceram todos preenchidos, sem o link "continuar" (não há mais próximo passo) — confirmando que `job_applications` foi atualizado em cada uma das 3 etapas.

Versão de teste (`Analista de RH Pleno - Teste Fluxo Guiado`) excluída da conta `teste.mentoria.pago@example.com` ao final, pela própria funcionalidade de exclusão (§5.16) — ficou um `job_applications` órfão (sem `resume_version_id`, por causa do `on delete set null`), invisível em qualquer tela, sem custo.

`npm run lint` e `npm run build` limpos. Testado localmente contra o mesmo Supabase de produção antes do deploy (env singular do projeto). Deployado e confirmado no ar.

### 5.18 Painel de evolução + checklist marcável (2026-07-20)

Proposta de modelo de dados discutida e aprovada antes de codar (checklist marcável escolhido em vez de lista estática).

**Migration `0011_evolution_panel.sql`** (aplicada pelo cliente):
- `linkedin_analyses` deixa de ser "1 por usuário" (upsert apagava o histórico a cada análise nova) — constraint `unique` removida, vira histórico como `resume_versions`. Ganhou `score integer` e `next_steps jsonb` (`[{text, done}]`).
- **Consequência aplicada de propósito, não como afterthought**: os três pontos do código que assumiam "no máximo 1 linha por usuário" (`analyzeLinkedin` upsert, `reuseLinkedinAnalysis`, a query em `linkedin/page.tsx`) foram corrigidos pra "pega a mais recente" (`order by created_at desc limit 1`) — é o mesmo tipo de bug que já mascarou o incidente de assinatura duplicada (`getCurrentUserPlan()` com `.maybeSingle()`), corrigido preventivamente aqui.
- `interview_sessions` ganhou `final_assessment text` + `next_steps jsonb` — antes o parecer final só existia como a última mensagem dentro do `transcript` (jsonb solto, sem campo próprio).

**Geração de IA virou JSON estruturado nos dois casos** (mesmo padrão do currículo adaptado, `response_format: json_object`):
- LinkedIn: `{ score (0-100), analysis (markdown), next_steps (2-3 strings) }`.
- Entrevista, só no turno de encerramento (a conversa normal continua texto livre — não faz sentido estruturar pergunta-resposta): `{ assessment (markdown), next_steps (2-3 strings) }`.

**Checklist marcável**: `toggleLinkedinNextStep` (linkedin/actions.ts) e `toggleInterviewNextStep` (entrevista/actions.ts, arquivo novo) — mesmo padrão nos dois: busca a linha, inverte `done` no índice pedido, grava o array inteiro de volta, escopado por `user_id`. UI otimista (marca na hora, reverte se o servidor recusar).

**Página nova** `/para-candidatos/painel/evolucao`, quinto card no hub (sempre acessível — o conteúdo pago fica com cadeado dentro da própria página, não no card): contagem de currículos adaptados (todo plano), contagem de entrevistas **concluídas** (`finished = true`, não conta abandonadas) e histórico de pontuação do LinkedIn (barra + nota), os dois últimos só Impulso+.

**Bug pego no ESLint antes de virar problema em produção**: `useEffect` sincronizando `nextSteps`/`analysisId` do resultado da action disparava `react-hooks/set-state-in-effect` (cascading render). Corrigido pro padrão que o próprio React recomenda pra "adaptar estado quando uma prop/estado externo muda" — comparar `state` com a renderização anterior e ajustar durante o render, não dentro de um efeito.

**Verificação de ponta a ponta — números conferidos direto no banco, não só na tela** (exigência explícita do cliente): PDF de teste gerado localmente (perfil fictício), enviado de verdade pro upload; análise saiu com nota 58/100 e 3 itens de checklist; marquei o primeiro item, recarreguei a página, confirmei que continuava marcado (persistência real, não só estado local). Entrevista: iniciada, encerrada, parecer final + checklist apareceram; marquei um item, confirmado via requisição de rede (200 OK no Server Action). Painel de evolução: os 3 números (7 currículos, 2 entrevistas concluídas, nota 58/100 mais recente) foram batidos contra uma query direta no Supabase com a service role — todos batem exatamente com o que estava gravado, incluindo o item do checklist marcado.

`npm run lint` e `npm run build` limpos.

### 5.19 Convite pro grupo de WhatsApp de vagas no primeiro currículo gerado (2026-07-21)

Pedido: quando o candidato tem, pela primeira vez, um currículo de verdade pra ver — qualquer plano —, mostrar um banner na tela com CTA pro grupo de WhatsApp de vagas diárias **e** enviar um e-mail com o mesmo convite, uma única vez por usuário (nunca de novo em currículos seguintes).

**Infra de e-mail — não existia antes**: `RESEND_API_KEY` já estava como placeholder vazio em `.env.local`/`.env.local.example` desde a Fase 3, mas nunca tinha sido ligado a nenhum código de envio. Confirmado por inspeção direta do projeto (não assumido) antes de implementar, conforme pedido pelo cliente. Opção mais simples oferecida e aceita: **Resend, tier gratuito** (3.000 e-mails/mês) — cliente pediu explicitamente pra não sugerir trocar de provedor até ele avisar.

**Dois pontos de disparo, uma única flag** — porque "primeiro currículo pronto pra ver" não é o mesmo momento em todos os planos:
- **Grátis**: salvar o perfil base já É ter um currículo pronto (a tela "Baixar meu currículo" renderiza direto de `profile_data`) — disparo em `saveBaseProfile` (`profile-actions.ts`), só quando o plano não é pago.
- **Impulso/Mentoria**: salvar o perfil ainda não gera nada visível — o momento real é a primeira "Adaptar para vaga" bem-sucedida — disparo em `generateAdaptedResume` (`curriculo/actions.ts`).

`candidate_profiles.whatsapp_invite_sent_at` (migration `0012_whatsapp_invite.sql`) é o único ponto de verdade: `maybeSendWhatsappInvite` (`src/lib/whatsapp-invite.ts`) faz um `update ... .is("whatsapp_invite_sent_at", null)` com `{ count: "exact" }` — só quem realmente zerou a coluna primeiro (`count > 0`) dispara o e-mail e recebe `true` de volta pra mostrar o banner nessa resposta específica. Qual dos dois pontos de disparo acontecer primeiro pra um usuário consome a flag; o outro vira no-op silencioso. Mesmo padrão de guarda contra corrida já usado em `deleteResumeVersion` (`.delete({ count: "exact" })`).

Falha ao enviar e-mail (Resend fora do ar, chave inválida, etc.) é logada e **nunca** bloqueia o salvamento do perfil ou a geração do currículo — o banner na tela já cobre o convite mesmo se o e-mail falhar.

**Banner** (`WhatsappInviteBanner`, novo componente): renderizado só na resposta que efetivamente disparou o convite — na tela "Baixar meu currículo" (Grátis, logo após o primeiro salvamento) e na tela do editor de currículo adaptado (planos pagos, logo após a primeira geração, mesmo local onde já existia o banner de "Continuar fluxo guiado"). Estado resetado ao sair dessas telas, pra não reaparecer em visitas seguintes à mesma tela.

**Consequência da restruturação**: a antiga tela "boas-vindas" (interstitial que substituía o currículo por um `WhatsappCta` sozinho, sem mostrar o currículo em si) foi removida de `curriculo-workspace.tsx` — não fazia sentido junto do novo requisito ("banner na própria tela, logo após o currículo ser gerado"). O componente `WhatsappCta` **não foi apagado**: continua em uso pela rota legada `/para-candidatos/comecar`.

**Bug real pego no teste ao vivo, depois da migration aplicada**: o rascunho automático do formulário (debounce de digitação + segurança de troca de aba, ambos em `base-profile-form.tsx`, feature já existente antes desta sessão) chama exatamente o mesmo `saveBaseProfile` do botão "Salvar perfil" — sem distinção. Numa conta Grátis nova, o próprio carregamento da tela (a troca de aba do navegador dispara o `visibilitychange`) já bastava pra disparar `saveBaseProfile` com o perfil ainda **vazio**, consumindo o convite único e tentando mandar um e-mail sobre um currículo que não existia — confirmado direto no banco (`whatsapp_invite_sent_at` preenchido 1 segundo depois da conta ser criada, `profile_data` com todos os campos `""`). **Corrigido** adicionando um parâmetro `isManualSave` a `saveBaseProfile` (`profile-actions.ts`): só os dois cliques deliberados — "Salvar perfil" (`base-profile-form.tsx`) e "Salvar alterações" na tela do currículo Grátis (`curriculo-workspace.tsx`) — passam `true`; o rascunho automático e a rede de segurança de troca de aba continuam chamando a função sem esse parâmetro (default `false`), então nunca mais disparam o convite sozinhos.

**Verificação ao vivo, com a migration `0012` já aplicada e a `RESEND_API_KEY` real configurada**:
1. Coluna `whatsapp_invite_sent_at` confirmada existente via `select` direto contra o Supabase antes de testar.
2. Conta Grátis nova criada — navegação automática até a tela de perfil vazia gerou um rascunho automático (linha em `candidate_profiles` criada), mas `whatsapp_invite_sent_at` ficou `null`, confirmando que o rascunho não dispara mais o convite (comportamento pré-fix, reproduzido e depois corrigido).
3. Perfil preenchido de verdade e "Salvar perfil" clicado: banner apareceu na tela na hora, link do CTA confirmado apontando pro grupo real (`https://chat.whatsapp.com/C3tT5hRZoKe7GRXdYfOeXQ`, abre em nova aba). `whatsapp_invite_sent_at` confirmado gravado no banco, junto com o `profile_data` completo (não mais vazio).
4. Log do servidor confirmou que o Resend foi chamado de verdade (chave válida, requisição aceita) e rejeitado só por causa do domínio de teste: `Invalid \`to\` field. Please use our testing email address instead of domains like \`example.com\`` — erro do próprio Resend, capturado e logado sem derrubar o salvamento do perfil (o banner continuou aparecendo normalmente).
5. Revisitei a tela e cliquei em "Salvar alterações" de novo: banner não reapareceu e nenhuma nova tentativa de e-mail foi logada — confirma que o convite dispara mesmo com repetição de salvamentos manuais.
6. Conta de teste removida ao final. `npm run lint` e `npm run build` limpos (39 rotas) depois do fix.

**Pendência real restante**: sem domínio próprio verificado no Resend, o remetente padrão (`onboarding@resend.dev`) só entrega pra endereços que não sejam de domínio de teste — precisa de um e-mail real (não `@example.com`) pra confirmar a entrega de ponta a ponta. Verificar um domínio (`RESEND_FROM_EMAIL`) antes de considerar o e-mail 100% validado em produção; o banner na tela já está confirmado funcionando independente disso. **Deployado em produção em 2026-07-21** (ver §5.21) — o que faltava aqui era só o domínio do Resend, não o deploy.

### 5.20 Voz nas perguntas da Simulação de Entrevista — TTS (2026-07-21)

Pedido do cliente após testar a entrevista: "o áudio não tocou". Investigação encontrou algo mais simples que um bug — **TTS nunca tinha sido implementado**, em nenhuma sessão anterior. `interview-chat.tsx` só tinha `SpeechRecognition` (voz do candidato → texto); `/api/ai/interview` só chamava `chat.completions.create` (texto puro); nenhum `<audio>`, nenhuma chamada a `audio.speech.create`, nenhum modelo de TTS reservado em `AI_MODELS`. O texto já em tela ("A IA faz perguntas por texto — você responde falando") documentava esse design assimétrico de propósito, não um bug.

Confirmado o gap, cliente pediu pra implementar agora, com autoplay (ver decisão via `AskUserQuestion`).

**Implementação**:
- `AI_MODELS.interviewVoice = "gpt-4o-mini-tts"` (`src/lib/ai/client.ts`) — mesmo raciocínio de custo/tier "mini" dos outros modelos.
- `/api/ai/interview/route.ts`: depois de gerar o texto da pergunta (só nos turnos normais, nunca no parecer final — que é um relatório longo em markdown pra LER, não pra ouvir), chama `openai.audio.speech.create({ model, voice: "alloy", input: reply })` e devolve o áudio como base64 no mesmo JSON de resposta (`audio`), sem round-trip extra. Falha na geração do áudio é capturada e logada — nunca derruba o turno, o candidato sempre tem a pergunta em texto de qualquer forma.
- `interview-chat.tsx`: `ChatMessage` ganhou `audioBase64?`; ao receber uma resposta com áudio, toca automaticamente via `new Audio(\`data:audio/mpeg;base64,...\`).play()`; cada balão da IA ganhou um botão 🔊 de "ouvir de novo" (ícone `Volume2`) como reforço manual caso o autoplay seja bloqueado em algum navegador específico.

**Verificação — e o limite real do que dava pra confirmar sozinho**: cliquei "Começar entrevista" de verdade numa conta Mentoria; o backend gerou e devolveu o áudio, o `play()` foi chamado, mas falhou no navegador automatizado usado pra teste (`NotSupportedError: Failed to load because no supported source was found`). Descartei bug investigando a fundo:
1. Gerei o mesmo TTS de forma independente (fora da aplicação) e escrevi um parser de frames MPEG que validou o arquivo inteiro: 142 frames MP3 válidos e consecutivos, ~3.4s, sem corrupção — áudio bem formado.
2. `canPlayType('audio/mpeg')` no mesmo navegador retornou `"probably"` — suporte a MP3 confirmado.
3. **Teste decisivo**: toquei um WAV estático mínimo e conhecidamente válido (nada a ver com TTS) no mesmo navegador — falhou com o **mesmo erro exato**. Prova que o navegador automatizado usado no teste não tem saída de áudio funcional (comum em ambientes headless/sandboxed), não que o TTS está quebrado.

Conclusão: implementação correta por todas as evidências disponíveis, mas **nenhuma ferramenta usada nesta sessão consegue de fato reproduzir som pra confirmar por ouvido** — isso ficou como pendência explícita pro cliente confirmar num navegador real (não bloqueante, mas também não "testado 100%" como o padrão desta sessão exige pra outras features). `npm run lint` e `npm run build` limpos.

### 5.21 Deploy de produção: banner de WhatsApp + TTS da entrevista (2026-07-21)

As duas features acima (§5.19 e §5.20) foram construídas e nunca deployadas — confirmado que só existe 1 commit no repositório (o inicial, de Fases 1-2) e que os deploys sempre foram feitos direto do diretório local via token da Vercel, nunca por git push (ver §5.19, achado do bug do banner "em breve por e-mail" que só existia porque produção rodava código antigo).

**Env vars adicionadas na Vercel antes do deploy** (mesmo padrão de escopo já usado em `NEXT_PUBLIC_CALCOM_LINK`/`OPENAI_API_KEY` — só `production`, não `preview`/`development`):
- `NEXT_PUBLIC_WHATSAPP_GROUP_LINK` = link real do grupo.
- `RESEND_API_KEY` = a mesma chave já em uso em `.env.local`.

Confirmado via API da Vercel que nenhuma das duas existia antes (não era duplicata) e que ambas foram criadas com sucesso antes de disparar o build, pra garantir que o deploy já saísse com elas.

**Deploy**: `vercel deploy --prod` a partir do diretório local (projeto `projeto-ec/ryze-hr`, sem `vercel link` prévio — feito na hora com `orgId`/`projectId` já conhecidos de deploys anteriores). Build limpo (39 rotas, TypeScript ok), `readyState: READY`, alias `https://ryze-hr.vercel.app` atualizado. Confirmado com `curl` que o domínio de produção responde `200` depois do deploy. Token usado uma única vez e apagado do scratchpad + `.vercel/` local removido logo em seguida (mesma disciplina de todo deploy nesta sessão).

### 5.22 Guia de onboarding do candidato pago (2026-07-21)

Pedido: candidato assina Impulso/Mentoria e cai direto nos 5 quadrados de ferramentas, sem nenhuma orientação de por onde começar. Antes de codar, o cliente pediu uma proposta explícita de como detectar "primeira vez depois de assinar (ou upgrade)" e como isso conviveria com o Painel de evolução e o fluxo guiado já existentes, sem duplicar informação — aprovada antes de qualquer código (ver histórico da conversa).

**Detecção — 1 coluna nova, reaproveitando um comportamento que já existia**: pesquisa confirmou que toda troca de plano (assinatura nova OU upgrade Impulso→Mentoria) já cria uma linha **nova** em `subscriptions` (cancela a assinatura antiga no Stripe e assina outra — `upgrade/actions.ts`); só renovação do mesmo plano atualiza a linha existente. Migration `0013_onboarding.sql` adiciona só `subscriptions.onboarding_seen_at timestamptz`. O hub usa a assinatura ativa mais recente (`getCurrentSubscription()`, novo em `server.ts`, mesma query/ordenação de `getCurrentUserPlan()`) — `onboarding_seen_at is null` = mostra a introdução sozinha. Como upgrade sempre cria linha nova, a introdução reaparece automaticamente com o plano novo, sem lógica extra pra comparar plano antigo x novo.

**Sem policy de UPDATE nova em `subscriptions`** (ela só tinha SELECT pro usuário, de propósito — ver 0002): em vez de abrir escrita geral numa tabela com `stripe_customer_id`/`status`, `dismissOnboardingIntro` (novo `onboarding-actions.ts`) autentica com o client normal e grava só essa coluna via service role, sempre escopado por `user_id` E `id` da assinatura.

**Sem duplicar Painel de evolução nem o fluxo guiado — tudo derivado, nada gravado como progresso**: `src/lib/guided-flow.ts` (novo) é a lógica única. Os 3 passos do fluxo guiado por vaga (`JobFlowDots`, já existente em `curriculo-workspace.tsx`) foram extraídos pra `getJobFlowSteps`/`getJobFlowNextHref` e o componente foi refatorado pra usá-las — não reimplementadas. O guia de 5 passos (`getOnboardingJourney`) lê as mesmas fontes: perfil (`candidate_profiles.profile_data`), a vaga mais recente incompleta (`job_applications`, critério aprovado pelo cliente), e `mentoring_sessions` pro passo 5 (só relevante/desbloqueado no plano Mentoria). Painel de evolução continua sendo a retrospectiva agregada (todos os currículos/entrevistas somados); o guia é o prospectivo, uma vaga só ("qual meu próximo passo agora") — nenhum dos dois grava contador ou flag de progresso à parte.

**UI**: `GuidedJourney` (`components/painel/guided-journey.tsx`) — cartão fixo no topo do hub (passo atual + barra de progresso, gradiente igual ao já usado no indicador de progresso do perfil) e uma introdução em 3 telas dispensável (boas-vindas → lista dos 5 passos com cadeado no passo de Mentoria pra quem está no Impulso → CTA final, que aponta pro próximo passo pendente de verdade, não sempre o passo 1 — importante pra quando reaberta via "Ver meu guia completo" depois de já ter avançado).

**Verificação de ponta a ponta**, com conta de teste descartável (perfil + assinatura semeados direto no banco via service role, mesma técnica já usada nesta sessão pra estados específicos difíceis de produzir via Stripe puro):
1. Assinatura Impulso nova (`onboarding_seen_at: null`) → login → introdução abriu sozinha, "Bem-vindo(a) ao plano Impulso", passo 5 (Mentoria) com cadeado na lista de 5 passos.
2. "Pular introdução" → confirmado no banco que `onboarding_seen_at` gravou na hora. Recarreguei a página: introdução não reabriu, cartão continuou visível (1/5, perfil já contava como feito).
3. "Ver meu guia completo" reabriu a introdução manualmente, confirmando o link permanente.
4. Simulei o upgrade exatamente como o código real faz (assinatura antiga → `status: canceled`, linha nova com `plan: mentoria`, `onboarding_seen_at: null`): recarreguei o hub e a introdução reapareceu sozinha, agora "Bem-vindo(a) ao plano Mentoria", passo 5 sem cadeado (numerado "5" normalmente).
5. Ação real: gerei um currículo adaptado pra uma vaga de verdade (`generateAdaptedResume`) — voltei ao hub e o cartão avançou pra "2/5 passos", passo atual "Analise seu perfil do LinkedIn", com o link `Continuar` já apontando `?vaga=<id>` da vaga certa — confirma que o cálculo reage a dado real, não só ao flag de onboarding.
6. `JobFlowDots` (currículo, refatorado) continuou funcionando sem regressão — "Continuar fluxo guiado" apareceu normalmente no histórico da vaga.
7. Conta de teste removida ao final. `npm run lint` e `npm run build` limpos (39 rotas).

### 5.23 Deploy de produção: guia de onboarding (2026-07-21)

Migration `0013_onboarding.sql` aplicada pelo cliente antes do teste. Nenhuma env var nova precisou ser adicionada (feature não depende de nenhuma configuração externa). `vercel deploy --prod` (mesmo processo do §5.21) — build limpo, `readyState: READY`, alias `https://ryze-hr.vercel.app` atualizado, confirmado com `curl` respondendo `200`. Token apagado do scratchpad logo depois.

### 5.24 Correção real: áudio do TTS não tocava no navegador do cliente (2026-07-22)

Cliente testou a Simulação de Entrevista em produção (print da tela real, ícones 🔊 visíveis ao lado de cada pergunta) e reportou que nenhum áudio saía — confirmando exatamente o risco que ficou registrado como pendência no §5.20 (o sandbox usado nesta sessão não tem saída de áudio, então nunca foi possível confirmar por ouvido; ficou marcado como "implementação correta por evidência indireta, mas não testado 100%").

**Causa raiz**: `data.audio` chegava certinho do servidor (por isso os ícones apareciam), mas `new Audio(...).play()` era chamado depois de um `fetch` assíncrono — fora da pilha de execução síncrona do clique do candidato. Navegadores com política de autoplay mais restritiva (Safari é o caso clássico) só liberam reprodução automática nessas condições se for exatamente o MESMO elemento `<audio>` que já tocou algo dentro de um clique de verdade antes; criar um `new Audio()` novo a cada resposta nunca fica "destravado".

**Correção** (`interview-chat.tsx`): um único `HTMLAudioElement` module-level (fora da árvore do React de propósito — um `useRef` seria desmontado ao trocar da tela inicial pra tela do chat, que são dois `return` JSX diferentes, perdendo o "destrave"). No clique em "Começar entrevista" (`handleStart`), toca um WAV silencioso síncrono nesse elemento pra destravá-lo; todas as reproduções seguintes (autoplay das perguntas + botão manual "ouvir de novo") reaproveitam o mesmo elemento já destravado, incluindo os turnos disparados depois de parar a gravação (que não são clique direto, só callback assíncrono da Web Speech API).

**Verificação**: `npm run lint` e `npm run build` limpos. Testado de novo no mesmo sandbox desta sessão — mesma limitação de sempre confirmada (o `.play()` real falha com o mesmo `NotSupportedError` já documentado, ambiente sem dispositivo de áudio), mas sem nenhuma regressão: fluxo de texto, geração da pergunta e histórico de mensagens continuaram funcionando normalmente. Como nenhuma ferramenta disponível nesta sessão consegue reproduzir som de verdade, a confirmação final de que o áudio agora toca depende do cliente testar em produção — pendência explícita, não assumida como resolvida.

**Deploy**: `vercel deploy --prod` — build limpo, `readyState: READY`, alias atualizado, `curl` confirmando `200`/`307` (rotas pública/protegida, ambas o esperado). Token apagado do scratchpad logo depois.

### 5.25 Causa real do §5.24: CSP bloqueando `data:` no áudio da entrevista, não autoplay (2026-07-22)

**A correção do §5.24 não resolveu** — cliente testou de novo em produção, no Edge, e o áudio continuou sem tocar. Isso invalidou a hipótese usada até aqui: Edge é Chromium, e a política de autoplay do Chromium é bem mais permissiva que a do Safari (libera reprodução automática pra qualquer chamada depois de UMA interação real na página, não exige ser o mesmo elemento) — então o "destrave por elemento único" do §5.24, embora não incorreto como prática, não era a causa real do problema.

**Causa raiz de verdade**: a CSP do site (`proxy.ts`) define `media-src 'self' blob:` — **sem `data:`**. O código usava `new Audio("data:audio/mpeg;base64,...")` pra tocar a pergunta. Um navegador que respeita CSP à risca (Edge é exatamente isso) bloqueia esse carregamento silenciosamente: o elemento nunca chega a carregar o recurso, e `.play()` rejeita com `NotSupportedError: Failed to load because no supported source was found` — o mesmíssimo erro que eu já vinha vendo no sandbox desta sessão desde o §5.20.

**Isso expõe um erro de diagnóstico meu no §5.20/§5.24**: concluí que o sandbox "não tem dispositivo de áudio" a partir de um teste de controle que também usava uma `data:` URI (um WAV silencioso) — ou seja, o teste de controle estava sujeito exatamente à mesma restrição de CSP que eu estava tentando isolar, então não provava nada sobre hardware. A conclusão pareceu bater (o WAV de controle falhou do mesmo jeito que o áudio real), mas por uma razão totalmente diferente da que eu assumi. Fica registrado pra não repetir: um teste de controle só é válido se ele **não compartilhar a variável que está sendo investigada** — nesse caso, o esquema da URI.

**Correção de verdade** (`interview-chat.tsx`): converter o base64 pra `Blob` + `URL.createObjectURL()` (`blob:`, já liberado na CSP) em vez de `data:` — sem alargar a política de segurança, que é mantida deliberadamente estreita nesta base de código (mesmo raciocínio já registrado em §5.15/§5.16 sobre CSP). `base64ToBlobUrl()` novo, usado tanto pro WAV de destrave quanto pro áudio real; a blob URL anterior é revogada (`URL.revokeObjectURL`) a cada nova pergunta pra não vazar memória ao longo de uma entrevista longa.

**Verificação — desta vez com prova de fato, não só ausência de erro**: instrumentei `window.Audio` no browser (patch do construtor + de `.play()`) antes de clicar "Começar entrevista", em vez de só olhar o console. Resultado: as duas chamadas de `.play()` (destrave + pergunta real) **resolveram** (não rejeitaram), `readyState: 4` (`HAVE_ENOUGH_DATA` — carregado por completo) e uma delas com `paused: false` (reproduzindo ativamente no momento da checagem). Refiz o teste do zero com reload completo e um marcador no console antes do clique — nenhum erro novo apareceu depois do marcador (as duas linhas de erro vistas antes eram resíduo do teste anterior, do código antigo). Essa é uma verificação categoricamente diferente da anterior: agora testei o mecanismo exato que estava falhando (rejeição de carregamento por CSP) e confirmei que ele passou a resolver — não é mais "ausência de erro presumindo hardware ausente", é "o navegador confirma que carregou e está tocando".

`npm run lint` e `npm run build` limpos. Segue como pendência a confirmação final por ouvido humano em produção (nenhuma ferramenta desta sessão reproduz som de verdade), mas agora com evidência técnica de que o carregamento e a reprodução funcionam de ponta a ponta.

**Nota**: o cliente também abriu o console (F12) em produção e achou, de forma independente e na mesma sessão, a mensagem exata de violação de CSP (`Loading media from '<URL>' violates ... 'media-src 'self' blob:'`) — confirmando a causa raiz de forma direta, não só inferida. Pediu explicitamente pra não alargar a CSP liberando `data:`, preferindo a conversão pra `blob:` (mesma decisão já tomada aqui).

**Deploy**: `vercel deploy --prod` — build limpo, `readyState: READY`, alias atualizado. Confirmado com `curl` que a CSP em produção continua exatamente `media-src 'self' blob:` (sem `data:` adicionado) e que o site responde `200`. Token apagado do scratchpad logo depois.

### 5.27 Redesign dos modelos visuais de currículo (2026-07-22 a 2026-07-23)

Pedido: revisar Moderno/Executivo/Criativo (hierarquia mais forte, cor de destaque consistente, espaçamento mais generoso), sem tocar em Básico, e adicionar um 5º modelo no mesmo estilo (duas colunas, cor de destaque, hierarquia forte). Cliente pediu prévia visual antes de aprovar — trabalho feito em duas rodadas.

**Rodada 1 — polimento dos 3 existentes + modelo novo "Elegante"**:
- Moderno/Executivo/Criativo: nome maior, títulos de seção com cor de destaque no texto (não só em detalhe/borda), espaçamento entre seções 18pt → 24-32pt.
- **Elegante** (novo, `supabase/migrations/0014_elegante_template.sql` — adiciona o slug na constraint de `resume_versions.template_slug`): sidebar à **direita** (os outros 3 usam esquerda), separada por traço fino em vez de bloco de cor preenchido, títulos de seção com traço curto de destaque embaixo em vez de borda/selo — pensado pra ser visualmente distinto dos outros três, não uma variação.
- **Prévia sem depender de screenshot**: a ferramenta de screenshot do browser trancou nesta sessão (confirmado não ser bug do código — timeout até numa aba nova, página não relacionada). Resolvido de duas formas: (1) artifact HTML estático reproduzindo os 4 modelos com CSS puro traduzido fielmente do Tailwind/estilos inline de `preview.tsx`; (2) depois, a pedido do cliente, PDFs de verdade gerados fora do browser via `npx tsx` chamando `renderToFile` do `@react-pdf/renderer` diretamente sobre `RESUME_PDF_COMPONENTS` (script descartável, apagado depois de cada uso) — mesmo motor usado em produção no botão "Baixar em PDF", não uma aproximação.
- **Bug real pego nos PDFs de teste**: nome do Moderno quebrava no meio da palavra ("Camila An-\ndrade Ferreira") — a coluna lateral tem só 36% da página, e o tamanho de fonte aumentado (18→22px) não cabia. Corrigido reduzindo só o nome do Moderno pra 19px (os outros 3 modelos continuam maiores) — confirmado com um novo PDF depois do ajuste.

**Rodada 2 — Executivo redesenhado do zero**: cliente anexou seu próprio currículo real (executivo sênior, doutorado, 14 anos de carreira) como referência de "mais profissional" e pediu pra eu olhar outras referências de mercado antes de subir uma nova versão. Pesquisa (Harvard/MIT career center, guias de resume ATS 2026) confirmou o padrão do currículo de referência: uma coluna só (não duas — sidebars são desaconselhados pra leitura correta por ATS), UMA cor de destaque usada com moderação (só em títulos de seção e nome de empresa, nunca em bloco/fundo), linhas finas em vez de blocos coloridos, contato numa linha só.

Reconstruí o Executivo inteiro nesse padrão — nome em caixa alta, subtítulo em itálico, linha fina de destaque sob o cabeçalho, títulos de seção com linha cinza fina embaixo, cargo — empresa (empresa em cor de destaque) com data alinhada à direita, formação/competências/idiomas em lista corrida. **Decisão de escopo**: só o Executivo recebeu essa contenção total — Moderno/Criativo/Elegante continuam com cor mais presente e duas colunas, virando as opções "expressivas" da lineup enquanto o Executivo vira a opção "segura e formal pra cargo sênior / ATS". Cliente aprovou esse recorte (`"blz"`) sem pedir a mesma contenção nos outros três.

Descrição do Executivo em `resume-schema.ts` atualizada pra refletir o novo posicionamento. Nenhuma migration nova precisou — `executivo` já era um slug válido desde a 0005, só o design mudou.

`npm run lint` e `npm run build` limpos nas duas rodadas. PDF de teste do Executivo redesenhado conferido linha por linha contra o padrão pesquisado — sem sobreposição, datas alinhadas, sem regressão.

**Deploy**: rodada 1 (Moderno/Executivo-v1/Criativo/Elegante) ainda não tinha sido deployada quando a rodada 2 chegou — as duas foram ao ar juntas num só `vercel deploy --prod` depois da aprovação da rodada 2. Build limpo, `readyState: READY`, alias atualizado, `curl` confirmando `200`. Token apagado do scratchpad logo depois.

**Pendência**: `supabase/migrations/0014_elegante_template.sql` ainda não foi confirmada como aplicada pelo cliente — sem ela, o preview do Elegante funciona (é só render client-side), mas salvar um currículo de verdade com esse modelo esbarra na constraint do banco.

## 6. Integrações externas — contas e onde estão as credenciais

**Importante:** por segurança, as chaves reais **não estão neste documento**. Elas vivem em dois lugares, ambos já configurados e funcionando:
- `.env.local` (raiz do projeto, git-ignorado)
- Vercel → projeto `ryze-hr` → Settings → Environment Variables

Para dar acesso ao arquiteto/dev responsável, adicione-o como colaborador direto em cada serviço (não copie as chaves por chat/e-mail):

| Serviço | Conta / projeto | O que já foi feito | Convide o time em |
|---|---|---|---|
| **Vercel** | Time `projeto-ec`, projeto `ryze-hr` | Deploy de produção ativo, todas as env vars configuradas, Deployment Protection desativada (site público) | vercel.com → time `projeto-ec` → Settings → Members |
| **Supabase** | Projeto ref `ezurjubhzrglysdklnsy` | Auth + 4 tabelas migradas (`leads`, `subscriptions`, `candidate_profiles`, e as 4 da Fase 4: `resume_versions`, `linkedin_analyses`, `interview_sessions`, `ai_usage_log`), RLS configurada em todas | supabase.com/dashboard → projeto → Settings → Team |
| **Stripe** | Conta da empresa (CNPJ), **modo de TESTE** | 2 produtos recorrentes (Impulso R$19,90/mês, Mentoria R$49,90/mês) + **endpoint de webhook de produção registrado** (`we_1TtUKOCyznRM0X1xZtxZaGJA` → `https://ryze-hr.vercel.app/api/webhooks/stripe`, eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) | dashboard.stripe.com → Settings → Team |
| **OpenAI** | Chave `OPENAI_API_KEY`, **paga**, uso definitivo (ver §5.2) | Configurada em `.env.local` **e** como env var de produção na Vercel (adicionada e deploy redisparado em 2026-07-16) | platform.openai.com → API keys |
| **Cal.com** | Conta pessoal `andre-cavalcanti-ycpcvc`, chave **live** (sem sandbox) | Event type "Sessão de Mentoria — Ryze" (30min, id `6334839`) já existia; webhook registrado via API apontando pra produção (`b68b6f1b-8cdb-4acb-bb00-db45184f55e4`); `CALCOM_API_KEY`/`CALCOM_WEBHOOK_SECRET`/`NEXT_PUBLIC_CALCOM_LINK` em `.env.local` e na Vercel | app.cal.com → Settings → Team (é conta pessoal, não de time — considerar migrar pra uma conta/organização da empresa antes de crescer) |

Variáveis de ambiente em uso (nomes — valores nos locais acima):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # só o webhook usa — nunca expor ao client
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET            # LOCAL: gerado pelo `stripe listen` (muda a cada sessão de teste)
                                  # PRODUÇÃO: fixo, do endpoint we_1TtUKOCyznRM0X1xZtxZaGJA (só target=production na Vercel)
NEXT_PUBLIC_STRIPE_PRICE_IMPULSO
NEXT_PUBLIC_STRIPE_PRICE_MENTORIA
NEXT_PUBLIC_WHATSAPP_GROUP_LINK  # vazio — pendente (ver §5.3)
OPENAI_API_KEY                   # preenchida, chave paga — ver §5.2. Em .env.local e já na Vercel (produção)
CALCOM_API_KEY                   # preenchida, chave live (sem sandbox) — ver §5.2.3. Em .env.local e na Vercel
CALCOM_WEBHOOK_SECRET            # gerado por nós, não pelo Cal.com — usado pra verificar x-cal-signature-256
NEXT_PUBLIC_CALCOM_LINK          # preenchida — link do event type de 30min
RESEND_API_KEY                   # vazio — não usado ainda
```

## 7. Decisões técnicas e "gotchas" que vale saber

- **Bug de contraste corrigido (`src/lib/utils.ts`)**: `tailwind-merge` por padrão trata qualquer classe `text-*` como um único grupo de conflito, então tamanhos de fonte customizados (`text-body-md`, `text-display-lg`...) colidiam com cores de texto (`text-white`, `text-fg`) e **apagavam a cor silenciosamente** (texto grafite-sobre-grafite, ilegível). Corrigido registrando os tamanhos customizados em um `classGroup` próprio via `extendTailwindMerge`. **Qualquer novo token `text-<nome>` precisa ser adicionado a essa lista.**
- **`middleware.ts` não existe mais — é `src/proxy.ts`** a partir do Next.js 16 (export `proxy`, não `middleware`; mesma API/matcher). Usar o nome antigo gera aviso de deprecated no build e (dependendo da versão) pode simplesmente não rodar.
- **`getSupabaseServerClient()` é assíncrono** (usa `cookies()` de `next/headers`, que é async) — todo call site precisa `await`.
- **Deploy pela Vercel CLI, não pelo dashboard**: a máquina de desenvolvimento (Windows) tem a Execution Policy do PowerShell restrita, o que bloqueia os shims `.ps1` que o `npm install -g` cria (`vercel.ps1`, `npx.ps1`). Workaround: invocar `node.exe` diretamente sobre `node_modules/vercel/dist/index.js`, ignorando os shims. Deploy roda com `--token`.
- **`vercel project add <nome>` sem framework**: criar o projeto via API/CLI sem passar pelo fluxo interativo padrão deixa `framework: null` nas configs — quebra o roteamento (build passa, toda rota 404). Precisa `PATCH /v9/projects/{id}` com `{ "framework": "nextjs" }` e redesplegar.
- **Deployment Protection (SSO) ligada por padrão** em contas de time novas na Vercel — bloqueia acesso público até ser desativada manualmente em Settings → Deployment Protection.
- **Nome do diretório com espaço/maiúsculas** (`Projeto Ryze`) quebra a inferência automática de nome em `create-next-app` e em `vercel project add`. Projeto na Vercel chama-se `ryze-hr`.
- **O `signing secret` (`whsec_...`) de um webhook do Stripe só é retornado uma vez**, na criação (`POST /v1/webhook_endpoints`). Se ele se perder, não tem como recuperar — só apagar o endpoint e criar outro. Sempre capturar e usar o secret **na mesma execução/script** que cria o endpoint.
- **Limite de e-mail do Supabase (free tier)**: `auth.signUp()` dispara e-mail de confirmação, e o limite de envio é baixo — testes repetidos de cadastro em pouco tempo esbarram em `over_email_send_rate_limit` (429). Para testar sem isso, criar usuário via `POST /auth/v1/admin/users` com `email_confirm: true` (não dispara e-mail) e testar o login normalmente.
- **Cuidado ao testar clicando em "primeiro botão submit da página"**: com o usuário logado, o Navbar tem seu próprio `<button type="submit">Sair</button>` (dentro de um `<form>`), que aparece antes de qualquer formulário de conteúdo no DOM. Um seletor genérico tipo `document.querySelector('button[type="submit"]')` pode acabar deslogando o usuário em vez de submeter o formulário pretendido — sempre escopar a busca dentro do `<form>` correto.
- **Gemini rejeita mensagens só com `system`, sem nenhuma `user`** (400 "contents is not specified") — diferente de OpenAI/Anthropic, que aceitam normalmente. Qualquer chamada nova ao `src/lib/ai/client.ts` que possa começar sem histórico de conversa (como o primeiro turno da entrevista) precisa garantir pelo menos uma mensagem `user`, mesmo que sintética.
- **Nomes de modelo da Gemini mudam/depreciam rápido para chaves novas**: `gemini-2.5-flash` (nome mais "óbvio") já responde 404 pra chaves criadas recentemente, e `gemini-2.0-flash` responde 429 com `limit: 0` de quota gratuita neste projeto. Antes de assumir um nome de modelo, confirmar contra `GET {baseURL}/models` com a chave real e testar uma chamada de verdade — não confiar só no nome "óbvio" ou em documentação desatualizada.
- **Upload de arquivo não é automatizável no Browser pane usado neste projeto** (`mcp__Claude_Browser__*`) — `form_input` não consegue setar `<input type="file">` (o navegador bloqueia isso por segurança) e não há ferramenta de `file_upload` dedicada nesse conjunto. Contornável via JS: `input.files = dataTransfer.files` (usando `DataTransfer`) É permitido pelo navegador, diferente de setar `.value` diretamente. A ferramenta Claude in Chrome (`mcp__claude-in-chrome__file_upload`) também resolve isso nativamente, mas depende da extensão estar instalada/conectada no Chrome real do usuário.
- **`pdf-parse` (via pdfjs-dist) quebra dentro do bundle do Next.js/Turbopack**: ele carrega seu "worker" com um `import()` dinâmico resolvido em runtime, que funciona rodando puro no Node mas falha dentro do servidor bundlado ("Setting up fake worker failed: Cannot find module pdf.worker.mjs" — o caminho é reescrito pro diretório de output do Turbopack, onde o arquivo não existe). Corrigido em `src/lib/pdf.ts` apontando `PDFParse.setWorker()` explicitamente pro arquivo real em `node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs` via `pathToFileURL`. Como esse arquivo só é referenciado por uma string em runtime (não um `import`/`require` estático), o rastreamento de arquivos da Vercel não o inclui sozinho no bundle de produção — por isso há um `outputFileTracingIncludes` em `next.config.ts` apontando pra ele, **uma entrada por rota que chama `extractPdfText()`** (hoje `/para-candidatos/painel/linkedin` e `/para-candidatos/painel/curriculo` — toda rota nova que usar essa função precisa entrar nessa lista, ver §5.7.1). Se a Vercel voltar a quebrar essa feature em produção mesmo com build local OK, checar esse include primeiro.
- **`pdf-parse`/`pdfjs-dist` também referencia `DOMMatrix` (API de navegador) em código de nível de módulo — quebra só no bundle de PRODUÇÃO da Vercel, nunca em `next dev` nem rodando puro no Node local** (`ReferenceError: DOMMatrix is not defined`, ver §5.7.1 pra investigação completa). Corrigido com um polyfill próprio (`src/lib/dommatrix-polyfill.ts`, usa `@thednp/dommatrix` como base e completa `invertSelf`/`preMultiplySelf` que o pacote não implementa) instalado antes do primeiro `import("pdf-parse")`. **Esse é o tipo de bug que só aparece com um PDF real em produção** — nenhum teste local pega isso, e o sintoma (mensagem genérica "não foi possível ler o arquivo") é idêntico ao do bug do worker acima, o que gerou um diagnóstico inicial incompleto nesta rodada. Se aparecer de novo, checar `dommatrix-polyfill.ts` está sendo chamado antes de qualquer uso de `pdf-parse`.
- **Server Actions do Next.js têm limite de 1MB no corpo da requisição por padrão** — qualquer upload de arquivo relevante (ex: PDF do LinkedIn com foto de perfil) passa disso fácil. Configurar via `experimental.serverActions.bodySizeLimit` em `next.config.ts` (hoje em `8mb`); **mudança em `next.config.ts` exige restart do `next dev`** (acontece automático, mas o build/HMR trava por alguns segundos nesse meio tempo).
- **`router.refresh()` chamado durante o corpo do render (fora de um event handler) é side effect impuro e pode interferir com outras atualizações de estado da mesma renderização** — descoberto ao tentar atualizar a lista de histórico de currículos logo após uma geração bem-sucedida: chamar `router.refresh()` junto com `setState` no corpo do componente (fora de `onClick`/`useEffect`) fez a própria transição de tela pro editor falhar de forma intermitente. Sempre chamar `router.refresh()` a partir de um handler de evento real.
- **`@react-pdf/renderer` não renderiza HTML/Tailwind** — precisa da sua própria árvore de componentes (`Document`, `Page`, `View`, `Text`, `StyleSheet.create`) e não lê variáveis CSS/tokens do tema. Qualquer novo modelo visual de currículo precisa de DOIS componentes que consomem os mesmos dados: um de preview (HTML normal) e um de PDF (react-pdf), com cores da marca copiadas como hex literal em ambos.
- **API v1 do Cal.com foi descontinuada** (`GET /v1/...` responde `410 decommissioned`) — usar sempre v2 (`api.cal.com/v2`, `Authorization: Bearer`). Confirmado com chamada real antes de escrever qualquer código, não assumido de memória/documentação antiga.
- **A v2 do Cal.com exige o header `cal-api-version` com um valor de data específico, e ele varia por endpoint** (ex: `2026-02-25` pra cancelar reserva) — não é uma versão única pra API inteira. Testar cada endpoint novo contra a doc oficial (`cal.com/docs/api-reference/v2/...`) antes de assumir o header certo.
- **Cal.com não tem modo sandbox/teste** — toda chave de API é "live". Qualquer teste de agendamento cria uma reserva de verdade no calendário real da conta. Usar e-mail de attendee fictício (não incomoda ninguém) e **cancelar cada reserva de teste imediatamente depois de confirmar o comportamento** — não dá pra simplesmente "resetar" como no modo teste do Stripe.
- **Testar o embed do `@calcom/embed-react`**: a UI real do widget é um `<iframe>` cross-origin (`app.cal.com/...`), então ferramentas de automação de navegador não conseguem ler o conteúdo de dentro dele nem interagir com o calendário. Pra confirmar que o embed carregou de verdade (não só "sem erro no console"), inspecionar o DOM do host (`document.querySelector('iframe').src` — deve apontar pro link certo, com `name`/`email` pré-preenchidos na query string, e o elemento `<cal-inline>` deve estar com `loading="done"`).
- **`Date.now()`/`new Date()` chamado direto no corpo de um componente é flagado pelo lint** (`react-hooks/purity`) **mesmo em Server Components** — o linter não distingue Server de Client Component nesse nível de análise, trata qualquer função que retorna JSX como sujeita às regras de pureza do React Compiler. Não flaga chamadas indiretas (uma função helper importada que internamente usa `new Date()`) — por isso comparações de data/hora "agora" viram uma função em `src/lib/*.ts` em vez de inline na página (ex: `isFutureDate()` em `src/lib/admin/date-ranges.ts`).
- **`GET /auth/v1/admin/users?email=...` não filtra server-side neste projeto** — devolve todos os usuários da conta, ignorando o parâmetro `email`. Confirmado testando direto antes de confiar nisso (o primeiro sintoma foi um bug real: `users?.[0]` pegava "o primeiro usuário da lista completa", não o usuário procurado — ver §5.4). Pra buscar um usuário por e-mail via Admin API, buscar a lista completa (`per_page=1000`, ajustar se a base crescer muito) e filtrar por e-mail exato no código.
- **`supabase.auth.admin.inviteUserByEmail()` valida entregabilidade do e-mail de verdade** (rejeita `@example.com` e outros domínios reservados/não-roteáveis com `email_address_invalid`) — diferente de `POST /auth/v1/admin/users` (usado nos outros usuários fictícios deste projeto), que só cria o registro sem tentar mandar nada. Testar convite de verdade precisa de um domínio real (ex: `@gmail.com`) mesmo que a caixa de entrada não exista/não seja checada.

## 8. Como rodar localmente

```bash
cd "Projeto Ryze"
npm install
npm run dev     # http://localhost:3000
```

Requer Node.js LTS (usado: v24.18.0) e um `.env.local` preenchido (ver §6). Sem as env vars, o site funciona normalmente — formulários que dependem de Supabase/Stripe falham de forma controlada (mensagem de erro amigável, sem quebrar a página).

Para testar o webhook do Stripe localmente: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (gera um `STRIPE_WEBHOOK_SECRET` novo a cada execução — atualizar no `.env.local` e reiniciar o servidor).

```bash
npm run lint     # ESLint
npm run build    # build de produção — usar antes de qualquer deploy
```

## 9. Deploy

```bash
node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" --prod --yes --project ryze-hr --token <VERCEL_TOKEN>
```

(No Windows, com a Execution Policy padrão restrita — ver §7. Em uma máquina Linux/Mac ou com policy liberada, `vercel --prod` funciona normalmente após `vercel login`.)

## 10. Próximos passos recomendados (ordem sugerida)

1. **Confirmar que o login real do owner funciona em `/admin`** — a linha em `admin_users` já foi inserida (§5.3, item 10), só falta o cliente confirmar visualmente.
2. **Enviar a Fase 5 pra Vercel** — o painel admin só rodou contra `localhost` até agora; nenhuma env var nova foi necessária (reaproveita as do Supabase já existentes), então é só redesplegar quando o cliente autorizar.
3. Fazer um teste manual rápido do upload de PDF do LinkedIn clicando de verdade no `<input type="file">` (não coberto pela automação desta rodada, ver §5.3).
4. **Conta do Cal.com é pessoal** (`andre-cavalcanti-ycpcvc`), não uma conta/organização da empresa — considerar migrar pra uma conta de time do Cal.com antes de crescer (múltiplos consultores, propriedade da conta não atrelada a uma pessoa física).
5. Assim que o cliente passar o link do grupo, preencher `NEXT_PUBLIC_WHATSAPP_GROUP_LINK` local e na Vercel.
6. Antes do lançamento comercial de verdade: ver checklist completo no §12.

## 11. Projeto completo — Fases 1 a 5 (resumo executivo)

Todas as 5 fases do roteiro original estão implementadas, testadas (com evidência real, não só codadas) e documentadas neste arquivo. Site em produção: **https://ryze-hr.vercel.app**.

- **Fase 1 — Design system**: paleta, tipografia, motivo de marca "dobra/faceta", componentes base, dark mode via classe. Showcase em `/design-system`.
- **Fase 2 — Páginas institucionais**: Home (B2B-first), Consultoria (hub + 4 serviços), Produtos (hub + 2), Sobre, Contato com captura de lead.
- **Fase 3 — Funil de candidatos + pagamento**: 3 planos (Grátis/Impulso/Mentoria), cadastro/login com sessão persistida, Stripe Checkout + webhook, fluxo do plano Grátis. Ver §5.1.
- **Fase 4 — Painel do candidato + IA**: dashboard logado, currículo com IA (JSON estruturado, 4 modelos visuais, editor, exportação em PDF), análise de LinkedIn (upload de PDF), simulação de entrevista por voz (Web Speech API). Provedor de IA: OpenAI (`gpt-5.4-mini`), chave paga — histórico de troca de provedor (Anthropic → OpenAI → Gemini temporário → OpenAI definitivo) documentado em §5.2/§5.2.2. Ver §5.2.
- **Fase 4b — Agendamento Cal.com (Mentoria)**: sessão mensal de 30min via widget embutido, webhook com verificação de assinatura, vínculo candidato↔reserva por ID (campo customizado oculto, com e-mail como cross-check), regra de "1 sessão por ciclo" garantida no servidor. Ver §5.2.3/§5.2.4.
- **Fase 5 — Painel administrativo**: `/admin` com 6 páginas (dashboard, leads, candidatos, custo de IA, mentoria, equipe), acesso via `admin_users` + Supabase Auth existente, sem sistema de login separado. Owner real configurado em 2026-07-16. Ver §5.4.

**Decisões de arquitetura que atravessam o projeto inteiro**, pra quem for mexer depois:
- Toda tabela sensível usa RLS restrita a "o próprio usuário lê a própria linha", com **escrita exclusiva via `service_role`** depois de alguma checagem de autorização no servidor (webhook assinado, Server Action com `requireAdmin()`, etc.) — nunca o cliente escrevendo direto em dados de outros usuários ou em tabelas operacionais (`ai_usage_log`, `admin_users`, `subscriptions`, `mentoring_sessions`).
- Toda integração de IA passa por um único arquivo (`src/lib/ai/client.ts`) — trocar de provedor é mudança isolada ali, nunca espalhada pelo código.
- Todo teste de ponta a ponta neste projeto foi feito com **dados fictícios de verdade rodando contra os serviços reais** (Stripe modo teste, Supabase real, Cal.com com reservas reais canceladas depois, chamadas de IA reais) — não mocks. Onde isso não foi possível (ex: clique nativo de upload de arquivo, login com senha real de terceiro), está registrado explicitamente como limitação, não escondido.

## 12. Checklist final antes do lançamento público

Consolidado de tudo que ficou pendente ao longo das 5 fases — nada aqui bloqueia o uso interno/de teste hoje, mas cada item precisa ser resolvido (ou conscientemente aceito) antes de abrir o site pra candidatos e clientes reais.

**Conteúdo/dados fictícios que não podem ir ao ar como estão:**
- [ ] Substituir os depoimentos fictícios de `/para-candidatos` (array `testimonials` em `src/app/para-candidatos/page.tsx`) por depoimentos reais — depoimento falso apresentado como real é propaganda enganosa (CDC art. 37).
- [ ] Revisar e substituir números/estatísticas "de exemplo" nas páginas de `/consultoria` e `/produtos` por dados reais e sourced (nunca métricas de cliente inventadas).
- [ ] Apagar os usuários fictícios de teste do Supabase: candidatos (`teste.fase4.candidato@example.com`, `teste.fase4.gratis@example.com`, `teste.fluxo.novo.zero@example.com`) e admin (`teste.fase5.owner@example.com`), e as linhas associadas em todas as tabelas.

**Integrações em modo de teste/temporário:**
- [ ] Trocar o Stripe de modo **Teste** pra modo **Live** — precisa de chaves novas (`sk_live_`/`pk_live_`) e um webhook de produção novo (o secret de teste não serve pro live).
- [ ] `CALCOM_API_KEY` já é uma chave live (sem sandbox) — nenhuma ação necessária aqui, só ciência de que qualquer teste futuro cria reserva real.
- [x] ~~`OPENAI_API_KEY` de tier gratuito~~ — resolvido, já é chave paga em produção.

**Configuração pendente do lado do cliente:**
- [ ] Link do grupo de WhatsApp (`NEXT_PUBLIC_WHATSAPP_GROUP_LINK`) — vazio, aguardando o cliente passar o link real (fallback gracioso enquanto isso: "link chega em breve").
- [x] ~~Owner real em `admin_users`~~ — inserido em 2026-07-16, login confirmado com a conta real em 2026-07-17 (ver §5.5.1).

**Deploy pendente:**
- [x] ~~Painel administrativo (Fase 5) ainda não foi enviado à Vercel~~ — deployado e confirmado em produção em 2026-07-17 (ver §5.5.1).

**Testes que a automação não conseguiu cobrir 100%:**
- [ ] Upload de PDF do LinkedIn nunca foi clicado por um `<input type="file">` de verdade via clique nativo do SO (testado via `DataTransfer`, o mais próximo que dá pra simular) — risco residual baixo, mas vale um clique humano real antes do lançamento.

**Não implementado (fora do escopo original, mas vale registrar):**
- [ ] `RESEND_API_KEY` nunca foi configurada — não há e-mail transacional próprio (além do que o Supabase Auth já manda nativamente: confirmação de cadastro, convite de admin). Decidir se isso é necessário antes do lançamento (ex: notificações de nova sessão de mentoria, lembrete de vaga).
- [ ] Performance: o site inteiro roda em renderização dinâmica (perdeu pré-geração estática) porque o Navbar lê a sessão em toda página. Não é um bug, é um trade-off consciente — existe correção via Partial Prerendering, não implementada por ser uma feature ainda em evolução no Next.js (não mexer sem aprovação explícita).

**Limitações conhecidas, aceitas conscientemente (não são pendências de verdade, só documentação):**
- Vínculo candidato↔reserva do Cal.com cai no fallback por e-mail (sem o cross-check por ID) só quando alguém agenda direto pelo link público do Cal.com, fora da página protegida `/painel/mentoria` — cenário incomum, não uma falha do fluxo normal.
- Conta do Cal.com é pessoal (`andre-cavalcanti-ycpcvc`), não uma conta/organização da empresa — considerar migrar antes de ter múltiplos consultores.
- Cinco reservas de teste reais foram criadas e canceladas no Cal.com do cliente durante os testes — nenhuma ficou pendente no calendário, mas o histórico "criado → cancelado" fica visível no painel do Cal.com.
