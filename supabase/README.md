# Supabase — OPB_CREW

## Estrutura

```
supabase/
└── migrations/
    ├── 001_initial_schema.sql  ← Cria tabela generated_content (V1 ✅)
    ├── 002_enable_rls.sql      ← Activa Row Level Security (V1 ✅)
    ├── 003_user_profiles.sql   ← Perfis de utilizador (V1 ✅)
    ├── 004_subscriptions.sql   ← Subscrições Stripe (V2 🔜)
    └── 005_publish_track.sql   ← Publish & Track + Engagement (V2 🔜)
```

## Como aplicar as migrações

Se precisares de recriar a base de dados do zero:

1. Vai ao Supabase Dashboard → SQL Editor
2. Aplica os ficheiros **por ordem numérica** (001 → 002 → 003...)
3. Os ficheiros V2 só aplicar quando construíres essas funcionalidades

## Tabelas

| Tabela | Descrição | Estado |
|--------|-----------|--------|
| `generated_content` | Conteúdo gerado pelo Content Factory | ✅ V1 |
| `user_profiles` | Perfis de utilizador sincronizados com Clerk | ✅ V1 |
| `subscriptions` | Subscrições e trial — integração Stripe | 🔜 V2 |
| `published_content` | Posts agendados e publicados | 🔜 V2 |
| `engagement_metrics` | Likes, comentários, partilhas por post | 🔜 V2 |

## Segurança

A segurança é garantida a dois níveis:
1. **API Routes (Clerk)** — todas as rotas verificam o utilizador autenticado
2. **RLS (Supabase)** — camada adicional de defesa no schema
