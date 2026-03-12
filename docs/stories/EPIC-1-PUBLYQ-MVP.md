# Epic 1 — PUBLYQ MVP

> Brand DNA → Voice DNA → Carrossel Instagram
> Target: 5 beta testers com feedback real
> Based on: PRD-PUBLYQ v2.0 + ARCH-PUBLYQ v1.0

---

## Stories

| # | Story | Points | Dependencies | Status |
|---|-------|--------|-------------|--------|
| 1.1 | [Setup projecto Next.js](1.1-setup-project.md) | 3 | None | ⬜ |
| 1.2 | [Copiar shared libs](1.2-copy-shared-libs.md) | 2 | 1.1 | ⬜ |
| 1.3 | [Clerk auth](1.3-clerk-auth.md) | 2 | 1.1 | ⬜ |
| 1.3.1 | [Clerk webhook](1.3.1-clerk-webhook.md) | 1 | 1.2, 1.3, 1.4 | ⬜ |
| 1.4 | [Database schema](1.4-database-schema.md) | 2 | None | ⬜ |
| 1.5 | [Brand DNA module](1.5-brand-dna-module.md) | 5 | 1.2, 1.3, 1.4 | ⬜ |
| 1.6 | [Voice DNA module](1.6-voice-dna-module.md) | 3 | 1.2, 1.3, 1.4, 1.5 | ⬜ |
| 1.7 | [Carousel module](1.7-carousel-module.md) | 5 | 1.5, 1.6 | ⬜ |
| 1.8 | [Dashboard pipeline](1.8-dashboard-pipeline.md) | 3 | 1.5, 1.6, 1.7 | ⬜ |
| 1.9 | [Landing page](1.9-landing-page.md) | 3 | 1.1 | ⬜ |
| 1.10 | [Deploy Vercel](1.10-deploy-vercel.md) | 2 | All | ⬜ |

**Total: 31 story points**

---

## Execution Order (Critical Path)

```
Parallel Track A:        Parallel Track B:
1.1 Setup Project        1.4 Database Schema
  ├── 1.2 Shared Libs        │
  ├── 1.3 Clerk Auth         │
  └── 1.9 Landing Page       │
        │                     │
        └─────────┬───────────┘
                  │
            1.5 Brand DNA
                  │
            1.6 Voice DNA
                  │
            1.7 Carousel
                  │
            1.8 Dashboard
                  │
            1.10 Deploy
```

---

## Sprint Goal

> Ter o MVP do PUBLYQ live em publyq.ai com o flow completo:
> Sign up → Brand DNA → Voice DNA → Gerar Carrossel → Exportar Imagens

---

*— River, removendo obstaculos 🌊*
