# OPE_SQUAD — CLAUDE.md
> One Person Empire | AI Operating System para Solopreneurs
> Fundador: Telmo Cerveira | Início: 2026-02-26

---

## 1. O QUE É ESTE PROJECTO

**Nome:** OPE_SQUAD
**Tipo:** SaaS Web Application
**Missão:** Dar a qualquer solopreneur o poder de uma equipa de 10 pessoas, sem saber programar nem usar o terminal.

### O Problema que Resolve
90% dos solopreneurs têm medo do terminal (tela preta). O AIOS + Claude Code tem poder enorme. O OPE_SQUAD é a interface web que torna esse poder acessível.

### Público-Alvo
Solopreneurs: coaches, consultores, criadores de conteúdo, freelancers. 1 pessoa, muitos chapéus, pouco tempo.

---

## 2. PRODUTO — V1: CONTENT ENGINE

**Problema específico resolvido:**
> "O solopreneur sabe o que vende mas não aparece todos os dias, em todo o lado, sem gastar 4 horas a criar conteúdo."

**Pipeline V1:**
```
ONBOARDING (15 min, uma vez)
  → Input: nicho + oferta + voz + plataformas
  → Output: Voice DNA card do solopreneur

CONTENT FACTORY (mensal)
  → Input: Voice DNA + período
  → AIOS gera: 30 posts por plataforma
  → Output: Instagram + LinkedIn + X + Email prontos

PUBLISH & TRACK (automático)
  → Agenda nas plataformas
  → Tracking de engagement
  → Ajuste de estratégia semanal
```

**Veto Conditions V1:**
- ❌ Conteúdo sem Voice DNA → BLOQUEADO
- ❌ Post sem call-to-action → BLOQUEADO
- ❌ Formato errado para plataforma → BLOQUEADO
- ❌ Publicar sem aprovação do utilizador (V1) → BLOQUEADO

---

## 3. STACK TECNOLÓGICO

| Camada | Tecnologia | Custo |
|--------|-----------|-------|
| Frontend | Next.js 14 + Tailwind CSS | $0 |
| Auth | Clerk | Grátis até 10k users |
| Database | Supabase | Grátis para V1 |
| AI Engine | Claude API (Anthropic) | Pay per use |
| Deploy | Vercel | Grátis para V1 |
| Pagamentos | Stripe | 2.9% + $0.30 |
| Afiliados | Rewardful | $49/mês |

---

## 4. SISTEMA OPERACIONAL DO NEGÓCIO

### Rotina Diária (7h/dia)
```
MANHÃ (4h) — BUILD
  07:00–09:00 → Desenvolvimento SaaS (Claude Code)
  09:00–11:00 → Features / bugs / melhorias

TARDE (3h) — GROW + RUN
  14:00–15:00 → Conteúdo (dogfood: usar o próprio produto)
  15:00–16:00 → Afiliados + suporte a utilizadores (DMs, feedback)
  16:00–17:00 → Vendas / afiliados / métricas
```

### 5 Engines do Negócio
1. **BUILD** → Como o produto evolui (Claude Code + AIOS)
2. **GROW** → Como utilizadores chegam (Content Engine dogfood)
3. **CONVERT** → Como leads viram pagantes (free trial → paid)
4. **RETAIN** → Como utilizadores ficam (resultados + suporte + afiliados)
5. **RUN** → Rotinas, finanças, operações diárias

### Modelo de Negócio
```
LANDING PAGE (SaaS)
    ↓
FREE TRIAL 7 dias (Stripe — cartão obrigatório)
    ↓
Day 8: Auto-cobra (Stripe)
    ↓
REWARDFUL: link de afiliado gerado automaticamente
    ↓
FLYWHEEL: resultado → partilha → novo utilizador → mais MRR
```

**Decisão confirmada (26/02/2026):** Skool removido do stack.
Razão: SaaS 100% nativo. Afiliado via Rewardful V1 → nativo V2.
Poupa $99/mês. Elimina dependência de plataforma terceira.

---

## 5. ESTRUTURA DE FICHEIROS

```
OPE_SQUAD/
├── app/                      ← Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx              ← Landing page
│   ├── (auth)/               ← Login/signup
│   └── (dashboard)/          ← App principal
│       ├── onboarding/       ← Voice DNA setup
│       ├── content/          ← Content Factory
│       └── publish/          ← Publish & Track
├── components/               ← UI components reutilizáveis
├── lib/                      ← Utilities, API calls
├── squads/                   ← AIOS agents (motor do produto)
│   └── content-squad/        ← Agents de criação de conteúdo
├── docs/                     ← Documentação
│   └── sistema-operacional.html ← Dashboard OPS (abre no browser)
├── .claude/                  ← Regras Claude Code
│   └── CLAUDE.md
├── CLAUDE.md                 ← Este ficheiro
└── README.md
```

---

## 6. AIOS INTEGRATION

O OPE_SQUAD usa AIOS internamente para:
- Gerar conteúdo para utilizadores (Content Engine)
- Operar o próprio negócio (squads internas)

### Agents relevantes para V1
- Content Manager → gera posts
- Social Media → adapta por plataforma
- Email Strategist → email sequences
- Research Analyst → trends + hooks

---

## 7. REGRAS DE DESENVOLVIMENTO

### Código
- TypeScript em todo o lado
- Comentários em Português
- Componentes pequenos e reutilizáveis
- Mobile-first (utilizadores usam telemóvel)
- Sem dependências desnecessárias

### Git
- Repositório: https://github.com/trcerveira/OPE_SQUAD
- Branch: `master`
- Commits: `feat:`, `fix:`, `docs:`, `chore:`
- Exemplo: `feat: content factory module V1`

### Regras de Comportamento
- Sempre responder em Português
- Mostrar opções antes de implementar (formato 1, 2, 3)
- Confirmar antes de apagar ficheiros
- Testar em mobile primeiro
- Nunca inventar dados ou prova social falsa

---

## 8. MÉTRICAS (North Star)

| Métrica | Alvo V1 |
|---------|---------|
| Utilizadores activos | 10 no primeiro mês |
| Posts gerados/utilizador | 30/mês |
| Conversão trial→paid | >30% |
| NPS | >50 |

---

## 9. REGRAS DE COMPORTAMENTO DO CLAUDE

### NEVER
- Implement without showing options first (always 1, 2, 3 format)
- Delete/remove content without asking first
- Delete anything created in the last 7 days without explicit approval
- Change something that was already working
- Pretend work is done when it isn't
- Process batch without validating one first
- Add features that weren't requested
- Use mock data when real data exists in database
- Explain/justify when receiving criticism (just fix)
- Trust AI/subagent output without verification
- Create from scratch when similar exists in `squads/`

### ALWAYS
- Present options as "1. X, 2. Y, 3. Z" format
- Use AskUserQuestion tool for clarifications
- Check `squads/` and existing components before creating new
- Read COMPLETE schema before proposing database changes
- Investigate root cause when error persists
- Commit before moving to next task
- Create handoff in `docs/sessions/YYYY-MM/` at end of session

---

## 10. SOBRE O FUNDADOR

**Telmo Cerveira** — solopreneur, fundador do 25 Method + OPE_SQUAD
- Nível de programação: iniciante (a aprender)
- Sempre responder em Português
- Explicações simples antes de implementar
- Confirmar antes de grandes mudanças

---

*OPE_SQUAD CLAUDE.md v1.0 — Fevereiro 2026*
*"One person. Full squad power."*
