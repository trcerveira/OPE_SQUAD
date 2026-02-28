# OPB Crew — Arquitectura do Sistema

## Visão Geral

```
UTILIZADOR
    ↓
LANDING PAGE (Next.js)
    ↓
CLERK AUTH (sign-in / sign-up)
    ↓
BETA ACCESS CHECK (middleware.ts)
    ↓
DASHBOARD (pipeline sequencial)
    ↓
┌──────────────────────────────────┐
│  1. GENIUS ZONE (24 perguntas)   │ → Clerk unsafeMetadata
│  2. MANIFESTO   (aceitar)        │ → Clerk unsafeMetadata
│  3. VOZ & DNA   (8 perguntas)    │ → Clerk unsafeMetadata
│  4. CONTENT FACTORY              │ → Claude API + Supabase
└──────────────────────────────────┘
```

---

## Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| Frontend | Next.js | 15.2 | App Router, SSR, API Routes |
| Styling | Tailwind CSS | 4 | Utility-first CSS |
| Auth | Clerk | 6.38 | Autenticação + metadados de utilizador |
| Database | Supabase | 2.98 | PostgreSQL + REST API |
| AI Engine | Claude API | SDK 0.78 | Geração de conteúdo |
| Deploy | Vercel | — | Hosting + CI/CD automático |
| Search | Tavily | — | Pesquisa viral para conteúdo |

---

## Fluxo de Dados

### Autenticação
```
Browser → Clerk Sign-In → JWT Token → middleware.ts
middleware.ts → verifica hasBetaAccess(email) → deixa passar ou redireciona
```

### Geração de Conteúdo
```
/content (página)
    → POST /api/generate
        → auth() [Clerk] — verifica sessão
        → currentUser() [Clerk] — busca Voz & DNA + Genius Profile
        → Anthropic SDK — envia prompt + DNA + perfil
        → Claude retorna conteúdo gerado
        → INSERT generated_content [Supabase]
        → resposta ao browser
```

### Sincronização de Perfil
```
/dashboard (página)
    → syncUserProfile() [lib/supabase/user-profiles.ts]
        → UPSERT user_profiles [Supabase]
        → actualiza email, nome, progresso
```

---

## Estrutura de Pastas

```
OPE_SQUAD/
├── app/                        ← Next.js App Router
│   ├── layout.tsx              ← Root layout (ClerkProvider + fonte)
│   ├── page.tsx                ← Landing page pública
│   ├── (auth)/                 ← Rotas de autenticação
│   │   ├── sign-in/            ← Clerk SignIn component
│   │   └── sign-up/            ← Clerk SignUp component
│   ├── (dashboard)/            ← Rotas protegidas (requerem login + beta)
│   │   ├── dashboard/          ← Dashboard principal
│   │   ├── genius/             ← Passo 1: Genius Zone
│   │   ├── manifesto/          ← Passo 2: Manifesto
│   │   ├── voz-dna/            ← Passo 3: Voz & DNA
│   │   ├── content/            ← Passo 4: Content Factory
│   │   ├── editorial/          ← Calendário editorial
│   │   ├── calendario/         ← Planner de posts
│   │   ├── settings/           ← Configurações do utilizador
│   │   └── admin/              ← Painel de admin (só super admins)
│   └── api/                    ← API Routes (server-side)
│       ├── generate/           ← POST: gera conteúdo com Claude
│       ├── content/            ← GET/DELETE: histórico de conteúdo
│       ├── voz-dna/            ← POST: guarda Voz & DNA no Clerk
│       ├── manifesto/          ← POST: gera texto do manifesto
│       ├── viral-research/     ← POST: pesquisa Tavily
│       ├── editorial/          ← POST: calendário editorial
│       ├── calendario/         ← POST: agendamento
│       ├── settings/           ← POST: brand colors
│       ├── admin/users/        ← GET: lista utilizadores (admin only)
│       └── waitlist/           ← POST: lista de espera pública
├── components/                 ← Componentes React reutilizáveis
│   ├── layout/                 ← Header, Sidebar, Navigation
│   ├── genius/                 ← Componentes Genius Zone
│   ├── manifesto/              ← Componentes Manifesto
│   ├── voz-dna/                ← Componentes Voz & DNA
│   ├── content/                ← Componentes Content Factory
│   ├── editorial/              ← Componentes Editorial
│   ├── calendario/             ← Componentes Calendário
│   ├── landing/                ← Componentes Landing Page
│   ├── settings/               ← Componentes Settings
│   └── design/                 ← Design system base
├── lib/                        ← Utilities e serviços
│   ├── supabase/
│   │   ├── server.ts           ← createServerClient() com service_role
│   │   ├── types.ts            ← Interfaces TypeScript de todas as tabelas
│   │   └── user-profiles.ts   ← syncUserProfile() — upsert automático
│   ├── config/
│   │   └── admins.ts           ← SUPER_ADMINS, BETA_USERS, isAdmin(), hasBetaAccess()
│   ├── validators/
│   │   └── index.ts            ← Schemas Zod para validação de input
│   └── genius/
│       └── calculate.ts        ← Motor de cálculo do Genius Profile
├── supabase/
│   ├── migrations/             ← Ficheiros SQL de migração (001-005)
│   └── README.md               ← Guia de aplicação de migrações
├── docs/                       ← Documentação técnica
│   ├── ARCHITECTURE.md         ← Este ficheiro
│   ├── API.md                  ← Documentação das API routes
│   └── SETUP.md                ← Guia de setup do projecto
├── middleware.ts               ← Protecção de rotas + verificação beta
├── CLAUDE.md                   ← Regras do projecto para Claude Code
└── .env.local                  ← Variáveis de ambiente (não commitado)
```

---

## Segurança

### Camadas de Protecção
1. **Clerk Auth** — todas as rotas protegidas verificam `auth()` ou `currentUser()`
2. **Beta Access** — `middleware.ts` verifica `hasBetaAccess(email)` antes de deixar passar
3. **Admin Check** — rota `/admin` e `/api/admin/*` verificam `isAdmin(email)`
4. **Row Level Security** — Supabase tem RLS activado (service_role bypassa, mas API routes filtram sempre por `user_id`)
5. **Input Validation** — `lib/validators/` com Zod em todas as rotas críticas

### Dados Sensíveis
- **Clerk** — armazena: email, nome, Genius Profile, Voz & DNA, progresso
- **Supabase** — armazena: conteúdo gerado, perfis de utilizador
- **Vercel** — variáveis de ambiente encriptadas
- **Nunca exposto** — service_role key, Clerk secret key, Anthropic API key

---

## Base de Dados

### Tabelas Activas (V1)
| Tabela | Propósito | Criada em |
|--------|-----------|-----------|
| `generated_content` | Posts gerados pelo Content Factory | Migration 001 |
| `user_profiles` | Perfis sincronizados com Clerk | Migration 003 |

### Tabelas Futuras (V2)
| Tabela | Propósito | Migration |
|--------|-----------|-----------|
| `subscriptions` | Trial + Stripe | 004 |
| `published_content` | Auto-publish | 005 |
| `engagement_metrics` | Likes, partilhas | 005 |

---

## Deploy

- **Plataforma**: Vercel
- **URL produção**: https://ope-squad.vercel.app
- **CI/CD**: automático — cada `git push master` faz deploy
- **Variáveis**: configuradas em Vercel Dashboard (encriptadas)
