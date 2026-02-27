# Supabase — OPE_SQUAD

## Estrutura

```
supabase/
└── migrations/
    ├── 001_initial_schema.sql  ← Cria tabelas e índices
    └── 002_enable_rls.sql      ← Activa Row Level Security
```

## Como aplicar as migrações

Se precisares de recriar a base de dados do zero:

1. Vai ao Supabase Dashboard → SQL Editor
2. Copia e cola o conteúdo de `001_initial_schema.sql` e executa
3. Copia e cola o conteúdo de `002_enable_rls.sql` e executa

## Tabelas

| Tabela | Descrição |
|--------|-----------|
| `generated_content` | Conteúdo gerado pelo Content Factory |

## Segurança

A segurança é garantida a dois níveis:
1. **API Routes (Clerk)** — todas as rotas verificam o utilizador autenticado
2. **RLS (Supabase)** — camada adicional de defesa no schema
