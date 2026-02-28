# OPB Crew — Guia de Setup

## Pré-requisitos

- Node.js 18+
- Conta Clerk (clerk.com)
- Projecto Supabase (supabase.com)
- Chave API Anthropic (console.anthropic.com)
- Conta Vercel (vercel.com) — para deploy

---

## 1. Clonar o repositório

```bash
git clone https://github.com/trcerveira/OPE_SQUAD.git
cd OPE_SQUAD
npm install
```

---

## 2. Configurar variáveis de ambiente

Cria um ficheiro `.env.local` na raiz do projecto:

```env
# Clerk — Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk — Rotas
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Tavily (pesquisa viral)
TAVILY_API_KEY=tvly-...
```

---

## 3. Configurar a base de dados Supabase

No **Supabase Dashboard → SQL Editor**, aplica as migrações por ordem:

```
supabase/migrations/001_initial_schema.sql  ← tabela generated_content
supabase/migrations/002_enable_rls.sql      ← RLS policies
supabase/migrations/003_user_profiles.sql   ← tabela user_profiles
```

> Os ficheiros 004 e 005 são para V2 — não aplicar ainda.

---

## 4. Configurar Clerk

1. Cria um projecto em clerk.com
2. Copia as chaves para o `.env.local`
3. Em **Clerk Dashboard → Redirects**, configura:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

---

## 5. Dar acesso beta

No ficheiro `lib/config/admins.ts`, adiciona o teu email:

```typescript
export const BETA_USERS: string[] = [
  "teu@email.com",
]
```

---

## 6. Arrancar o servidor de desenvolvimento

```bash
npm run dev
```

Abre http://localhost:3000 no browser.

> **Nota:** A porta pode variar (3000, 3003, 3006...). Vê a linha `Local:` no terminal.

---

## 7. Deploy no Vercel

```bash
vercel --prod
```

Ou liga o repositório GitHub ao Vercel e os deploys são automáticos a cada `git push`.

---

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar código |
| `vercel --prod` | Deploy para produção |
| `git push` | Push + deploy automático |
