# PRD — OPE_SQUAD (OPB Crew)
> Product Requirements Document · Versão 1.0
> Autor: Telmo Cerveira | Data: 28 Fevereiro 2026
> Status: **Draft**

---

## 1. VISÃO DO PRODUTO

### O Problema
O solopreneur sabe o que vende, mas não aparece todos os dias, em todo o lado — sem gastar 4+ horas por dia a criar conteúdo. 90% das ferramentas existentes exigem conhecimento técnico, tempo de aprendizagem elevado, e ainda assim entregam conteúdo genérico que não soa à voz do utilizador.

### A Solução
**OPB Crew** é um SaaS que dá a qualquer solopreneur o poder de uma equipa de 10 pessoas — sem saber programar. Através de uma pipeline sequencial (Genius Zone → Voice DNA → Content Factory), o sistema codifica a identidade do utilizador e usa Claude AI para gerar conteúdo que soa genuinamente à sua voz.

### Proposta de Valor
> *"Em menos de 10 minutos, tens 30 posts prontos a publicar — na tua voz, para o teu público, sem esforço."*

### Métricas MaaS (Methodology as a Service)
| Método | Eficiência de Transferência |
|--------|---------------------------|
| Cursos online | 13% |
| SaaS genérico | 8–10% |
| **OPB Crew (MaaS)** | **40–58%** |

---

## 2. UTILIZADORES-ALVO

### Persona Principal — O Solopreneur Ocupado
| Atributo | Detalhe |
|----------|---------|
| **Quem é** | Coach, consultor, freelancer, criador de conteúdo |
| **Dimensão do negócio** | 1 pessoa, múltiplos papéis |
| **Problema core** | Falta de presença online consistente |
| **Nível técnico** | Básico — usa smartphone e browser |
| **Tempo disponível** | <30 min/dia para criação de conteúdo |
| **Dor principal** | "Sei o que vendo mas não sei como comunicar isso todos os dias" |

### Persona Secundária — O Early Adopter Tech
| Atributo | Detalhe |
|----------|---------|
| **Quem é** | Fundador de startup, marketer, creator avançado |
| **Necessidade** | Automação e escala de conteúdo |
| **Valor extra** | API access, integrações avançadas |

---

## 3. FUNCIONALIDADES — V1 (ESTADO ACTUAL)

### Pipeline Sequencial (One-time Setup)

#### FR-01 — Genius Zone `/genius`
- **O quê:** 24 perguntas baseadas em 7 frameworks (Hendricks, Hamilton, Clifton, Sullivan, Kolbe, Hogshead, Hormozi)
- **Output:** Genius Profile — zona de génio, perfil, voz ideal, squad recomendado
- **Storage:** Clerk `unsafeMetadata`
- **Estado:** ✅ Completo

#### FR-02 — Manifesto `/manifesto`
- **O quê:** Leitura e aceitação de 10 princípios operacionais
- **Output:** Compromisso guardado
- **Storage:** Clerk `unsafeMetadata`
- **Estado:** ✅ Completo

#### FR-03 — Voice DNA `/voz-dna`
- **O quê:** 8 perguntas sobre nicho, oferta, dor do cliente, tom, diferencial
- **Output:** Voice DNA card (arquétipo, tom, vocabulário, frases assinatura)
- **Storage:** Clerk `unsafeMetadata`
- **Estado:** ✅ Completo

### Pipeline Contínua (Uso Diário)

#### FR-04 — Content Factory `/content`
- **O quê:** Utilizador escolhe tema + plataforma → Claude gera post na sua voz
- **Plataformas:** Instagram, LinkedIn, X (Twitter), Email
- **Output:** Post formatado, pronto a copiar/publicar
- **Storage:** Supabase `generated_content`
- **Integrações:** Claude API (geração) + Tavily (pesquisa viral de hooks)
- **Estado:** ✅ Completo

#### FR-05 — Editorial Calendar `/editorial` + `/calendario`
- **O quê:** Visualização mensal/semanal de posts planeados; agendamento
- **Output:** Calendário com posts por data
- **Storage:** Supabase `editorial` + `calendario`
- **Estado:** ⏳ Estrutura criada, implementação pendente

#### FR-06 — Design Machine `/machine`
- **O quê:** Gerador de carrosséis Instagram (9 slides, 1080×1350px)
- **Pipeline:** Conteúdo (18 textos) → Imagens (Unsplash + upload) → Cores → Export ZIP
- **Integrações:** Unsplash API, html-to-image, JSZip
- **Estado:** ✅ V1 completo (melhorias em curso)

---

## 4. FUNCIONALIDADES — V2 (ROADMAP)

### Prioridade Alta

#### FR-07 — Geração de Conteúdo com IA na Design Machine
- Utilizador entra com tema → Claude gera 18 textos automaticamente no formato correcto
- Elimina o passo manual de escrever/colar textos

#### FR-08 — Nome de Marca Personalizável na Design Machine
- Campo de input para o nome da marca (actualmente hardcoded "OPB Crew")
- Guardado nas Settings e aplicado a todos os slides

#### FR-09 — Export de Alta Qualidade
- `pixelRatio: 2` para exports a 2160×2700px (profissional para Instagram)
- Actualmente: `pixelRatio: 1`

#### FR-10 — Zoom/Modal no Slide Preview
- Clicar num slide miniatura abre modal com preview em tamanho legível

### Prioridade Média

#### FR-11 — Guardar Trabalho em Progresso (localStorage)
- Estado da Design Machine persiste entre sessões
- Botão "Retomar sessão anterior"

#### FR-12 — Templates Adicionais na Design Machine
- Template Futurista
- Template Autoral 2.0
- Template Twitter/X

#### FR-13 — Edição Directa de Texto por Slide
- No Passo 4 (Preview), clicar num slide abre editor inline do texto desse slide

### Prioridade Baixa / V3

#### FR-14 — Auto-Publish
- Publicação directa em Instagram, LinkedIn, X via API
- Storage: `published_content`

#### FR-15 — Analytics Nativo
- Tracking de engagement (likes, partilhas, alcance)
- Dashboard de métricas por post

#### FR-16 — Afiliados Nativo
- Substituir Rewardful por sistema próprio
- Link de afiliado único por utilizador

---

## 5. REQUISITOS NÃO-FUNCIONAIS

### NFR-01 — Performance
- Time to First Value: **< 10 minutos** (primeiro post gerado)
- Tempo de geração de conteúdo: **< 5 segundos** por post
- Export de carrossel ZIP: **< 30 segundos**

### NFR-02 — Segurança
- Autenticação via Clerk (OAuth + email)
- Row Level Security em todas as tabelas Supabase
- Variáveis de ambiente nunca expostas no cliente
- Beta access: email whitelist em `lib/config/admins.ts`

### NFR-03 — UX / Acessibilidade
- Mobile-first (utilizadores acedem maioritariamente por telemóvel)
- Interface em Português de Portugal
- Sem jargão técnico na UI
- Feedback visual em todas as operações assíncronas (loading states)

### NFR-04 — Fiabilidade
- Geração de conteúdo com fallback se Claude API falhar
- Mensagens de erro claras e accionáveis (não "something went wrong")

### NFR-05 — Escalabilidade
- Supabase Free tier suficiente para V1 (< 500 utilizadores)
- Migrar para Pro quando MRR > €200/mês

---

## 6. RESTRIÇÕES (CONSTRAINTS)

| Código | Restrição |
|--------|-----------|
| CON-01 | Stack fixo: Next.js 15 + Clerk + Supabase + Claude API |
| CON-02 | Deploy exclusivo na Vercel |
| CON-03 | Sem publicação automática em redes sociais na V1 (manual only) |
| CON-04 | Beta fechado — acesso por whitelist até product-market fit |
| CON-05 | Sem app móvel nativa na V1 (PWA aceitável) |
| CON-06 | Comentários de código em Português |

---

## 7. MODELO DE NEGÓCIO

### Funil de Aquisição
```
Landing Page (pública)
        ↓
Free Trial 7 dias (Stripe — cartão obrigatório)
        ↓
Day 8: Auto-cobrança
        ↓
Rewardful: link de afiliado automático por utilizador
        ↓
Flywheel: resultado → partilha → novo utilizador → MRR
```

### Pricing (Planeado)
| Plano | Preço | Features |
|-------|-------|---------|
| **Starter** | $29/mês | Content Factory, Design Machine |
| **Pro** | $67/mês | + Calendário, Analytics, Suporte prioritário |
| **Annual** | $497/ano | Pro + desconto 40% |

### Stack de Negócio
| Serviço | Custo | Propósito |
|---------|-------|----------|
| Clerk | Grátis (< 10k users) | Autenticação |
| Supabase | Grátis V1 | Base de dados |
| Vercel | Grátis V1 | Deploy |
| Claude API | Pay-per-use | Geração de conteúdo |
| Stripe | 2.9% + $0.30 | Pagamentos |
| Rewardful | $49/mês | Programa de afiliados |
| Unsplash | Grátis (1k req/hora) | Imagens |
| Tavily | Grátis (1k pesquisas/mês) | Research viral |

---

## 8. MÉTRICAS DE SUCESSO

### North Star Metric
> **Posts gerados e publicados por utilizador activo por mês**

### KPIs V1
| Métrica | Alvo Mês 1 | Alvo Mês 3 |
|---------|-----------|-----------|
| Utilizadores activos | 10 | 50 |
| Posts gerados/utilizador/mês | 30 | 50 |
| Conversão trial → paid | > 30% | > 40% |
| NPS | > 50 | > 65 |
| Task Completion Rate | > 70% | > 80% |
| Time to First Value | < 10 min | < 5 min |
| Churn mensal | < 10% | < 7% |

---

## 9. DEPENDÊNCIAS TÉCNICAS

### APIs Externas
| Serviço | Chave | Localização |
|---------|-------|------------|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | `.env.local` |
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | `.env.local` |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` |
| Tavily | `TAVILY_API_KEY` | `.env.local` |
| Unsplash | `UNSPLASH_ACCESS_KEY` | `.env.local` |

### Stack Core
- **Next.js 15.2** — App Router, Server Components, API Routes
- **TypeScript 5** — Tipagem estrita
- **Tailwind CSS v4** — Estilização
- **React 19** — UI
- **Zod 4** — Validação de inputs

---

## 10. ESTRUTURA DE ÉPICOS (Roadmap de Stories)

### ÉPICO 1 — Core Pipeline (Setup Único)
- Story 1.1: Genius Zone completo ✅
- Story 1.2: Manifesto completo ✅
- Story 1.3: Voice DNA completo ✅

### ÉPICO 2 — Content Engine (Uso Diário)
- Story 2.1: Content Factory com Claude + Tavily ✅
- Story 2.2: Histórico de conteúdo gerado ✅
- Story 2.3: Editorial Calendar ⏳
- Story 2.4: Calendário visual de agendamento ⏳

### ÉPICO 3 — Design Machine
- Story 3.1: Template Principal (9 slides) ✅
- Story 3.2: Unsplash + Multi-upload ✅
- Story 3.3: Paleta personalizada ✅
- Story 3.4: Geração de textos com IA (FR-07) ❌
- Story 3.5: Nome de marca personalizável (FR-08) ❌
- Story 3.6: Export pixelRatio 2 (FR-09) ❌
- Story 3.7: Zoom/Modal no preview (FR-10) ❌
- Story 3.8: Templates adicionais (FR-12) ❌

### ÉPICO 4 — Monetização
- Story 4.1: Integração Stripe (trial 7 dias → cobrança) ❌
- Story 4.2: Webhooks Stripe (activate/cancel subscription) ❌
- Story 4.3: Rewardful afiliados ❌

### ÉPICO 5 — Growth & Analytics
- Story 5.1: Analytics nativo (FR-15) ❌
- Story 5.2: Auto-publish Instagram (FR-14) ❌
- Story 5.3: Dashboard de métricas ❌

---

## 11. RISCOS

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Claude API custo elevado com escala | Médio | Alto | Rate limiting por utilizador, caching de respostas |
| Unsplash rate limit (1k/hora) | Baixo | Médio | Cache de pesquisas recentes |
| Dependência de Clerk para metadados | Médio | Alto | Migrar dados críticos para Supabase progressivamente |
| CORS em exports de imagens | Médio | Médio | Usar proxy para imagens externas |
| Conteúdo gerado de má qualidade | Baixo | Alto | Testes A/B de prompts, feedback loop do utilizador |

---

## 12. FORA DE ÂMBITO (V1)

- App móvel nativa (iOS/Android)
- Publicação automática em redes sociais
- Editor de vídeo / Reels
- Multi-tenancy / workspaces de equipa
- White-label / resell
- Suporte a idiomas além do Português e Inglês

---

## HISTÓRICO DE VERSÕES

| Versão | Data | Autor | Alterações |
|--------|------|-------|-----------|
| 1.0 | 2026-02-28 | Telmo Cerveira / Orion (AIOS) | Versão inicial |

---

*PRD gerado com AIOS Master Orchestrator (Orion) · OPE_SQUAD v0.1.0*
