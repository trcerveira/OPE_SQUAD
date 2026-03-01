# Workflow: Onboarding Optimization Protocol

**Quando usar:**
- Trial conversion abaixo de 30%
- Activation rate abaixo do target
- Churn alto nos primeiros 30 dias
- Redesenho completo do onboarding
- Lançamento de novo fluxo de signup

**Objectivo:** Time to First Value < 10 min, Trial→Paid > 30%, Month 2 retention > 70%.

---

## Fase 0 — Diagnóstico (30 min)

**Executor:** Onboarding Chief + Samuel Hulick

```
DADOS NECESSÁRIOS:
  □ Funil actual: signup → Genius Zone → Voice DNA → 1º post → conversão
  □ Drop-off rates em cada passo
  □ Tempo médio em cada passo
  □ Feedback qualitativo dos que desistiram

OUTPUT:
  → Bottleneck identificado (passo com maior drop-off)
  → Hipótese: "O utilizador desiste no passo X porque Y"
```

**Checkpoint:** Bottleneck identificado antes de avançar.
**Veto:** Sem dados de funil → não avançar com suposições.

---

## Fase 1 — UX Audit (1-2h)

**Executor:** Samuel Hulick + Ramli John

```
TEARDOWN do fluxo actual:
  □ Quantos clicks do signup até ao 1º post gerado?
  □ O utilizador sabe o que fazer em cada passo?
  □ Há textos confusos, botões ambíguos, dead ends?
  □ Onde está o "aha moment" — e é cedo o suficiente?

EUREKA Framework (Ramli John):
  □ E — Establish value prop before signup
  □ U — Understand user goals quickly
  □ R — Reduce friction to first value
  □ E — Enable the aha moment
  □ K — Keep users coming back
  □ A — Amplify through advocacy

OUTPUT:
  → Lista de problemas de UX ordenados por impacto
  → Proposta de fluxo simplificado
```

**Checkpoint:** Lista de problemas aprovada antes de redesenhar.
**Veto:** Mais de 5 problemas → priorizar top 3 apenas.

---

## Fase 2 — Desired Outcome Mapping (1h)

**Executor:** Lincoln Murphy + Wes Bush

```
CUSTOMER SUCCESS framework:
  □ Qual é o DESIRED OUTCOME do utilizador? (não feature, resultado)
  □ "Required Outcome" vs "Appropriate Experience"
  □ O produto entrega o Required Outcome no trial?

PLG framework:
  □ O utilizador consegue experimentar valor SOZINHO? (self-serve)
  □ Há bloqueios que exigem contacto humano?
  □ O pricing é claro e transparente?

OUTPUT:
  → Mapa de desired outcomes por persona
  → Lista de bloqueios ao self-serve
  → Recomendações de PLG
```

**Checkpoint:** Desired outcomes validados.
**Veto:** Se o produto não entrega o required outcome no trial → fix product first.

---

## Fase 3 — Email Lifecycle Design (1-2h)

**Executor:** Val Geisler + Ramli John

```
SEQUÊNCIA DE EMAILS (behavioural triggers):

EMAIL 1 — Welcome (trigger: signup)
  → Bem-vindo + próximo passo claro + 1 acção

EMAIL 2 — Nudge (trigger: 24h sem completar Genius Zone)
  → "Faltam 5 minutos para teres o teu perfil"

EMAIL 3 — First Win (trigger: 1º post gerado)
  → "O teu primeiro post está pronto! Aqui está."
  → Celebração + encorajamento

EMAIL 4 — Re-engage (trigger: 48h sem actividade)
  → "O que te impediu? Preciso de 10 minutos teus."

EMAIL 5 — Trial Ending (trigger: day 5)
  → "O teu trial acaba em 2 dias. Aqui está o que geraste."

EMAIL 6 — Last Day (trigger: day 7)
  → "Hoje é o último dia. O que decides?"
  → Sem pressão, com clareza

OUTPUT:
  → 6+ emails com triggers, copy e CTA definidos
  → A/B test suggestions para cada email
```

**Checkpoint:** Emails aprovados antes de implementar.
**Veto:** Email sem trigger comportamental → não enviar.

---

## Fase 4 — Implementação + Métricas (1-2h)

**Executor:** Onboarding Chief + Wes Bush

```
IMPLEMENTAÇÃO:
  □ Mudanças de UX aplicadas (top 3 do Fase 1)
  □ Emails configurados com triggers
  □ Tracking de métricas configurado

MÉTRICAS A MONITORIZAR:
  □ TTFV (Time to First Value) — target: <10 min
  □ Activation rate (gera 1 post) — target: >60%
  □ Email open rates — target: >40%
  □ Trial→Paid conversion — target: >30%
  □ Month 2 retention — target: >70%

REVISÃO:
  □ Check semanal nos primeiros 30 dias
  □ Se conversion <20% após 2 semanas → voltar a Fase 0
```

**Checkpoint:** Métricas baseline registadas antes de mudar.
**Veto:** Implementar sem métricas = voar às cegas.

---

## Output de Cada Fase

| Fase | Output obrigatório |
|------|-------------------|
| 0 — Diagnóstico | Bottleneck identificado + hipótese |
| 1 — UX Audit | Top 3 problemas + proposta de fluxo |
| 2 — Desired Outcomes | Mapa de outcomes + bloqueios |
| 3 — Email Lifecycle | 6+ emails com triggers e copy |
| 4 — Implementação | Mudanças aplicadas + métricas tracking |
