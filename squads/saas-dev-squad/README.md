# saas-dev-squad
> Full-stack SaaS development squad para OPB Crew
> Stack: Next.js 15 + TypeScript + Supabase + Clerk + Vercel + Claude API

---

## O Problema que Este Squad Resolve

Erros constantes de build, TypeScript, deploy e arquitectura que bloqueiam o desenvolvimento.
Este squad cobre toda a equipa de desenvolvimento — do frontend ao DevOps — com agentes baseados em frameworks documentados de elite.

---

## Activação

```
@saas-dev-squad               → Chief (routing automático)
@saas-dev-squad:matt-pocock   → Erro TypeScript
@saas-dev-squad:delba-oliveira → Erro App Router / build
@saas-dev-squad:uncle-bob     → Diagnóstico de arquitectura
@saas-dev-squad:kent-dodds    → Testes
@saas-dev-squad:jez-humble    → CI/CD e deploy
@saas-dev-squad:tanya-janca   → Segurança
```

---

## Estrutura do Squad

### Orchestrator
| Agente | Papel |
|--------|-------|
| saas-dev-chief | Routing e coordenação do squad |

### Tier 0 — Diagnóstico
| Agente | Especialidade | Framework |
|--------|--------------|-----------|
| uncle-bob | Clean Architecture + SOLID | Clean Architecture (livro) |
| martin-fowler | Refactoring + Patterns | Patterns of Enterprise App Architecture |

### Tier 1 — Masters
| Agente | Especialidade | Framework |
|--------|--------------|-----------|
| matt-pocock | TypeScript | Total TypeScript |
| delba-oliveira | Next.js App Router | Vercel/Next.js docs |
| josh-comeau | Frontend React/Next.js | Joy of React |
| brad-frost | Component systems | Atomic Design |
| giancarlo-buomprisco | SaaS backend patterns | MakerKit |
| phil-sturgeon | API design | Build APIs You Won't Hate |
| kent-dodds | Testing JS/TS | Testing JavaScript |
| jez-humble | CI/CD + deployment | Continuous Delivery |
| tanya-janca | Security | Alice & Bob Learn App Security |

### Tier 2 — Sistemáticos
| Agente | Especialidade | Framework |
|--------|--------------|-----------|
| addy-osmani | Web performance | Performance Budgets |
| charity-majors | Observability | Observability Engineering |
| gleb-bahmutov | E2E testing | Cypress Workshop |
| ryan-singer | Process / Shape Up | Shape Up (Basecamp) |
| lee-robinson | Vercel deployment | Vercel docs |

---

## Workflows

| Workflow | Quando usar |
|---------|------------|
| wf-fix-error | Qualquer erro — triagem → diagnóstico → fix → prevenção |
| wf-deploy-checklist | Antes de qualquer deploy para produção |

---

## Guia Rápido — Qual agente para cada erro?

| Erro | Agente |
|------|--------|
| `Type 'X' is not assignable to type 'Y'` | matt-pocock |
| `useState is not a function (Server Component)` | delba-oliveira |
| `Dynamic server usage: Route couldn't be rendered statically` | delba-oliveira |
| `Hydration failed` | delba-oliveira |
| `Build failed on Vercel` | lee-robinson |
| `Function violates SRP` | uncle-bob |
| `Duplicated code` | martin-fowler |
| `API returns 500` | phil-sturgeon |
| `RLS policy blocking query` | giancarlo-buomprisco |
| `Test failing` | kent-dodds |
| `Deploy timeout` | jez-humble + lee-robinson |
| `Security: exposed key` | tanya-janca |
| `Slow page` | addy-osmani |
| `Can't debug production error` | charity-majors |
