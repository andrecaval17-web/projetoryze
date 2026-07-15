# Ryze — Handoff técnico

> Documento de contexto para o time técnico. Atualizado em 2026-07-14.
> Repositório local: `C:\Users\ti\Documents\Projeto Ryze` (ainda sem Git iniciado).
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
| Framework | Next.js 16.2.10 (App Router, Turbopack) | Versão recente — comportamento pode divergir do que modelos de IA "sabem" de treino; há docs locais em `node_modules/next/dist/docs/` |
| Linguagem | TypeScript | strict mode |
| UI | React 19 | Server Components por padrão; Client Components (`"use client"`) só onde há interatividade |
| Estilo | Tailwind CSS v4 | config **CSS-first** em `src/app/globals.css` (`@theme inline`), não há `tailwind.config.ts` |
| Componentes | Autorais (não é shadcn/ui, mas segue padrão similar) | `class-variance-authority` + `tailwind-merge` (customizado — ver §7) + `@radix-ui/react-slot` |
| Banco / Auth | Supabase (Postgres + Auth) | `@supabase/supabase-js` puro, ainda **sem** `@supabase/ssr` (sem sessão persistida) |
| Pagamentos | Stripe (Checkout + Subscriptions) | SDK `stripe` (server-only) |
| IA (planejado, Fase 4) | Anthropic API | Ainda não integrado — chamadas devem ser sempre backend (route handlers), nunca client |
| Agendamento (planejado, Fase 4) | Cal.com | Ainda não integrado |
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
│   │   └── checkout/sucesso/     # retorno pós-pagamento Stripe
│   ├── cadastro/                 # signup + Server Action + integração Stripe
│   ├── login/                    # signin + Server Action
│   ├── contato/                  # lead form + Server Action → Supabase
│   ├── sobre/
│   └── design-system/            # showcase interno (noindex), NÃO linkado no nav
├── components/
│   ├── ui/                       # primitivos (Button, Badge, Card, PricingCard, inputs...)
│   ├── brand/                    # motivo de marca: FoldArrow, FoldMesh, NeuralHero, Logo...
│   ├── layout/                   # Navbar, Footer
│   └── sections/                 # blocos compostos reutilizáveis entre páginas
└── lib/
    ├── supabase/{client,server}.ts
    ├── stripe/server.ts
    ├── plans.ts                  # fonte única dos 3 planos de candidato
    └── utils.ts                  # cn() — ver §7 sobre o fix do tailwind-merge

supabase/migrations/0001_leads.sql  # única migration existente até agora
.env.local.example                  # todas as env vars documentadas
```

## 4. Design system (resumo)

- Paleta de marca fixa: `ink #2E2C2A`, `paper #F3F0EA`, `paper-dark #17140F`, gradiente accent `#FF8A4C → #E85C2A → #A83E1D`.
- **Dark mode via classe `.dark`**, não via `prefers-color-scheme` — default é sempre claro. Um script bloqueante no `<head>` (`layout.tsx`) aplica a classe antes do primeiro paint pra evitar flash.
- **Padrão importante de arquitetura**: qualquer subtree pode ser forçada para o escopo escuro independente do tema da página, aplicando `className="dark"` no wrapper (ex: Navbar e Footer são sempre grafite; o hero da Home é sempre escuro). Isso funciona porque os tokens semânticos (`--bg`, `--fg`, `--border`...) são redefinidos dentro de `.dark { ... }` em `globals.css`, e todo componente consome esses tokens via classes Tailwind (`bg-bg`, `text-fg`), nunca cor literal.
- Showcase completo de tokens/componentes em `/design-system` (rota interna, não indexada).

## 5. Status por fase

- [x] **Fase 1 — Design system**: completa e validada.
- [x] **Fase 2 — Páginas institucionais**: Home, Consultoria (hub+4), Produtos (hub+2), Sobre, Contato. Completa.
- [~] **Fase 3 — Funil de candidatos + pagamento**: EM ANDAMENTO. Ver §6 abaixo — frontend completo, Stripe Checkout funcional ponta a ponta (testado ao vivo), mas falta persistência de sessão e webhook.
- [ ] **Fase 4 — Painel do candidato + IA**: não iniciada. Depende da Fase 3 terminar.
- [ ] **Fase 5 — Painel administrativo**: não iniciada.

### Fase 3 — o que está feito

- `/para-candidatos`: página de planos completa, estrutura de funil PAS (hero → como funciona → agitação → **depoimentos** → planos → FAQ → CTA).
  - ⚠️ **Os depoimentos em `testimonials.tsx`/`para-candidatos/page.tsx` são fictícios/exemplo** — marcados com comentário no código. Precisam ser substituídos por depoimentos reais antes do lançamento (depoimento falso apresentado como real é propaganda enganosa, CDC art. 37).
  - Plano **Mentoria** é o destacado/recomendado (decisão comercial deliberada — Impulso funciona como "decoy").
- `/cadastro` e `/login`: formulários reais, ligados a `supabase.auth.signUp` / `signInWithPassword`.
- **Stripe Checkout integrado**: no cadastro, se o plano escolhido é pago, o Server Action cria uma `checkout.session` via API do Stripe e faz `redirect()` direto pra página hospedada do Stripe. **Testado ao vivo, funcionando.**
- `/para-candidatos/checkout/sucesso`: página de retorno que consulta a sessão do Stripe (`checkout.sessions.retrieve`) e confirma se o pagamento foi aprovado antes de exibir a mensagem de boas-vindas.
- `/contato`: formulário de lead, grava em `leads` (tabela) via Server Action.

### Fase 3 — o que falta (bloqueia a Fase 4)

1. **Persistência de sessão de login.** Hoje `signUp`/`signIn` funcionam mas não deixam o usuário "logado" entre páginas — falta migrar para `@supabase/ssr` (cookies) e criar um `middleware.ts` de refresh de sessão.
2. **Webhook do Stripe** (`checkout.session.completed`) — hoje o pagamento é aprovado no Stripe mas **nada escreve isso de volta no Supabase**. Precisa de uma route handler (`/api/webhooks/stripe`) validando a assinatura do webhook e atualizando uma tabela `subscriptions`/`profiles` com o plano ativo do usuário. Essa tabela ainda não existe — só `leads` foi migrada.
3. **Fluxo do plano Grátis**: hoje o cadastro grátis só cria a conta; falta o formulário de currículo em si e o link do grupo de WhatsApp (o link precisa vir do cliente).
4. Rodar a migration `supabase/migrations/0001_leads.sql` no projeto Supabase (ainda não aplicada — só existe local; ver §6).

## 6. Integrações externas — contas e onde estão as credenciais

**Importante:** por segurança, as chaves reais **não estão neste documento**. Elas vivem em dois lugares, ambos já configurados e funcionando:
- `.env.local` (raiz do projeto, git-ignorado)
- Vercel → projeto `ryze-hr` → Settings → Environment Variables

Para dar acesso ao arquiteto/dev responsável, adicione-o como colaborador direto em cada serviço (não copie as chaves por chat/e-mail):

| Serviço | Conta / projeto | O que já foi feito | Convide o time em |
|---|---|---|---|
| **Vercel** | Time `projeto-ec`, projeto `ryze-hr` | Deploy de produção ativo, env vars configuradas, Deployment Protection desativada (site público) | vercel.com → time `projeto-ec` → Settings → Members |
| **Supabase** | Projeto ref `ezurjubhzrglysdklnsy` | URL + chave publishable (`sb_publishable_...`, formato novo) configuradas. **Nenhuma tabela própria migrada ainda** (só o schema de Auth padrão) | supabase.com/dashboard → projeto → Settings → Team |
| **Stripe** | Conta da empresa (CNPJ), **modo de TESTE** | 2 produtos recorrentes criados via API: Impulso (R$19,90/mês) e Mentoria (R$49,90/mês) — os Price IDs estão salvos nas env vars `NEXT_PUBLIC_STRIPE_PRICE_IMPULSO`/`_MENTORIA` | dashboard.stripe.com → Settings → Team |

Variáveis de ambiente em uso (nomes — valores nos locais acima):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET          # vazio — só necessário quando o webhook (§5.2) for implementado
NEXT_PUBLIC_STRIPE_PRICE_IMPULSO
NEXT_PUBLIC_STRIPE_PRICE_MENTORIA
ANTHROPIC_API_KEY              # vazio — Fase 4
NEXT_PUBLIC_CALCOM_LINK        # vazio — Fase 4
RESEND_API_KEY                 # vazio — não usado ainda
```

## 7. Decisões técnicas e "gotchas" que vale saber

- **Bug de contraste corrigido (`src/lib/utils.ts`)**: `tailwind-merge` por padrão trata qualquer classe `text-*` como um único grupo de conflito, então tamanhos de fonte customizados (`text-body-md`, `text-display-lg`...) colidiam com cores de texto (`text-white`, `text-fg`) e **apagavam a cor silenciosamente** (texto grafite-sobre-grafite, ilegível). Corrigido registrando os tamanhos customizados em um `classGroup` próprio via `extendTailwindMerge`. **Qualquer novo token `text-<nome>` precisa ser adicionado a essa lista.**
- **Deploy pela Vercel CLI, não pelo dashboard**: a máquina de desenvolvimento (Windows) tem a Execution Policy do PowerShell restrita, o que bloqueia os shims `.ps1` que o `npm install -g` cria (`vercel.ps1`, `npx.ps1`). Workaround: invocar `node.exe` diretamente sobre `node_modules/vercel/dist/index.js`, ignorando os shims. Deploy roda com `--token` (não há sessão de login interativa configurada nesta máquina).
- **`vercel project add <nome>` sem framework**: criar o projeto via API/CLI sem passar pelo fluxo interativo padrão deixa `framework: null` nas configs do projeto — isso quebra o roteamento do Next.js na Vercel (build passa, mas toda rota retorna 404). Precisa fazer `PATCH /v9/projects/{id}` com `{ "framework": "nextjs" }` e redesplegar.
- **Deployment Protection (SSO) ligada por padrão** em contas de time novas na Vercel — bloqueia acesso público ao link de produção até ser desativada manualmente em Settings → Deployment Protection.
- **Nome do diretório com espaço/maiúsculas** (`Projeto Ryze`) quebra a inferência automática de nome em `create-next-app` e em `vercel project add` (ambos exigem nome slug). O projeto na Vercel chama-se `ryze-hr`, diferente do nome da pasta local.

## 8. Como rodar localmente

```bash
cd "Projeto Ryze"
npm install
npm run dev     # http://localhost:3000
```

Requer Node.js LTS (usado: v24.18.0) e um `.env.local` preenchido (ver §6). Sem as env vars, o site funciona normalmente — formulários que dependem de Supabase/Stripe falham de forma controlada (mensagem de erro amigável, sem quebrar a página).

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

1. Aplicar a migration `0001_leads.sql` no Supabase (SQL Editor do dashboard).
2. Implementar sessão persistida (`@supabase/ssr` + middleware).
3. Criar tabela `subscriptions`/`profiles` + webhook do Stripe.
4. Fluxo do plano Grátis (form de currículo + link do WhatsApp).
5. Fase 4: painel do candidato (currículo com IA via Anthropic API, versões por vaga, agendamento Cal.com para Mentoria).
6. Antes do lançamento: substituir depoimentos fictícios por reais, revisar todo número/estatística "de exemplo", trocar Stripe de modo Teste para modo Live.
