# Workflow: Content Generation Pipeline

**Quando usar:**
- Utilizador pede para gerar conteúdo para qualquer plataforma
- Revisão de conteúdo gerado que precisa de melhoria
- Definição de estratégia de conteúdo para novo utilizador
- Batch production semanal

**Objectivo:** Post pronto a publicar, na voz do utilizador, adaptado à plataforma.

**Pré-requisitos obrigatórios:**
- ✅ Voice DNA preenchido (BLOQUEIO ABSOLUTO sem isto)
- ✅ Genius Profile completo
- ✅ Pelo menos 1 pilar de conteúdo definido

---

## Fase 0 — Validação de Inputs (automático)

**Executor:** Content Chief

```
CHECK:
  □ Voice DNA existe? → Se NÃO → BLOQUEIO. Redirigir para Voice DNA setup.
  □ Genius Profile existe? → Se NÃO → BLOQUEIO. Redirigir para Genius Zone.
  □ Tema fornecido pelo utilizador? → Se NÃO → Sugerir 3 temas baseados nos pilares.
  □ Plataforma escolhida? → Se NÃO → Default: LinkedIn.
```

**Veto:** Sem Voice DNA → ZERO conteúdo gerado. Sem excepções.

---

## Fase 1 — Estratégia & Ângulo (Ann Handley)

**Executor:** Ann Handley (Tier 0 — Diagnosis)

```
ANÁLISE DO TEMA:
  □ O tema encaixa num pilar de conteúdo? (Expertise/História/Opinião/Prova)
  □ Qual é o ponto de vista do utilizador sobre isto?
  □ BBB Test: É Bigger, Bolder, Braver?

OUTPUT:
  → Ângulo definido (não apenas tema, mas PERSPECTIVA sobre o tema)
  → Tipo de post: teach / inspire / provoke / prove
  → Target reader: quem ESPECÍFICAMENTE precisa de ler isto
```

**Checkpoint:** Ângulo aprovado antes de avançar para hooks.

---

## Fase 2 — Hooks & Estrutura (Nicolas Cole)

**Executor:** Nicolas Cole (Tier 1)

```
GERAR 3 HOOKS (tipos diferentes):
  □ Hook tipo 1: [escolher dos 7 tipos]
  □ Hook tipo 2: [escolher dos 7 tipos]
  □ Hook tipo 3: [escolher dos 7 tipos]

ESTRUTURA 1/3/1:
  □ 1 — Hook (da opção escolhida)
  □ 3 — Body points (ideias principais)
  □ 1 — CTA ou reflexão final

ADAPTAR AO FORMATO DA PLATAFORMA:
  □ LinkedIn: text-first, 1300-2000 chars
  □ Instagram: visual-first, carrossel ou caption curta
  □ X: thread ou standalone <280 chars
  □ Email: story → lição → CTA
```

**Checkpoint:** Hook e estrutura definidos antes de escrever o post.

---

## Fase 3 — Voz & Personalidade (Laura Belgray)

**Executor:** Laura Belgray (Tier 1)

```
VOICE DNA APPLICATION:
  □ Vocabulário do utilizador aplicado?
  □ Tom correspondente ao Voice DNA?
  □ Histórias/experiências pessoais incluídas?
  □ Idiosyncrasies do utilizador presentes?

VOICE VALIDATION (4 testes):
  □ Read Aloud Test: soa natural?
  □ Friend Test: "isto soa como tu?"
  □ Vocabulary Check: palavras que usaria?
  □ Opinion Test: opinião é do utilizador?

ANTI-CORPORATE CHECK:
  □ Zero jargão desnecessário
  □ Tom conversacional (não formal)
  □ Personalidade presente (não genérico)
```

**Checkpoint:** Post soa como o utilizador, não como IA.
**Veto:** Se falha 2+ testes de voz → regenerar com mais weight no Voice DNA.

---

## Fase 4 — Profundidade & Originalidade (David Perell)

**Executor:** David Perell (Tier 1)

```
CONTENT TRIANGLE CHECK:
  □ Personal Experience presente?
  □ Curated Knowledge presente?
  □ Original Insight presente?

DEPTH CHECK:
  □ O post diz algo que NÃO foi dito antes desta forma?
  □ Há uma conexão inesperada?
  □ O leitor vai pensar "nunca tinha visto assim"?

Se <2 checks no Content Triangle → adicionar profundidade
Se depth check falha → sugerir cross-pollination ou contrarian angle
```

**Checkpoint:** Conteúdo tem profundidade, não é apenas "mais um post."

---

## Fase 5 — Formatação & Entrega (Joe Pulizzi)

**Executor:** Joe Pulizzi (Tier 2)

```
FORMATO FINAL:
  □ Adaptado à plataforma (não copy-paste entre plataformas)
  □ CTA presente e relevante
  □ Comprimento adequado ao formato
  □ Hashtags/tags se aplicável

REPURPOSE PLAN:
  □ Identificar 2-3 formatos adicionais para repurpose
  □ Gerar versões adaptadas se solicitado

CALENDAR INTEGRATION:
  □ Post associado a um pilar de conteúdo
  □ Sugestão de melhor dia/hora para publicar
```

**Output final:** Post pronto a publicar + sugestões de repurpose.

---

## Output de Cada Fase

| Fase | Output obrigatório |
|------|-------------------|
| 0 — Validação | Inputs confirmados (Voice DNA, tema, plataforma) |
| 1 — Estratégia | Ângulo + tipo + target reader |
| 2 — Hooks | 3 opções de hook + estrutura 1/3/1 |
| 3 — Voz | Post na voz do utilizador (4 testes passam) |
| 4 — Profundidade | Content Triangle >=2/3, depth check pass |
| 5 — Formatação | Post final + CTA + repurpose plan |

---

## Quick Generate (modo rápido)

Para geração rápida (utilizador regular, Voice DNA já calibrado):

```
Fases 1-5 executam em paralelo/condensado:
  → Ângulo + Hook + Voz + Profundidade num só passo
  → Output: post pronto em <30 segundos
  → Voice DNA já calibrado = menos validação necessária
```

Usar Quick Generate quando:
- Voice DNA tem >10 posts gerados anteriormente
- Utilizador é regular (>2 semanas de uso)
- Tema é dentro dos pilares já definidos
