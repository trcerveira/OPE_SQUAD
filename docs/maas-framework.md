# MaaS Framework
**Methodology as a Service — Teoria da Comunicação Aplicada a Transferência de Conhecimento com IA**

> Documento de referência para o OPE_SQUAD.
> Autor: Telmo | Versão 1.0 | Fevereiro 2026
> Fonte: Biblioteca MaaS v3.1 (José Amorim, 2026) + Shannon-Weaver (1949)

---

## O Que é o MaaS

O MaaS quantifica a eficiência de transferência de conhecimento e mostra como maximizá-la usando IA.

**Premissa:** Toda comunicação perde sinal. A IA funciona como amplificador — aumenta o sinal útil, reduz o ruído.

**No contexto do OPE_SQUAD:** Cada interação com o utilizador é uma tentativa de transferir know-how. Se o Ke (eficiência) for baixo, o utilizador não executa, não tem resultados, e cancela. Se for alto, torna-se evangelista.

---

## A Equação MaaS

```
Ke = (T × A(t) × M × AmpIA × Lcg) / (Lci + Lce) × (1 ± sigma)
```

| Variável | Nome | Significado |
|---------|------|-------------|
| **T** | Qualidade do Expert | A metodologia embutida no software |
| **A(t)** | Capacidade do Utilizador | O que já sabe + estado actual (motivado? cansado?) |
| **M** | Meio | A UX. Um dashboard confuso = cano estreito |
| **AmpIA** | Amplificador de IA | A IA traduz conceitos genéricos em orientação personalizada |
| **Lcg** | Prática Real | O utilizador fez algo concreto? Sem prática não há resultado |
| **Lci** | Complexidade Intrínseca | Complexidade do assunto — gerir com micro-passos |
| **Lce** | Complexidade Extrínseca | Ruído do ambiente — UX confusa, notificações, distrações |
| **sigma** | Variação do Mundo Real | ±25% — o sistema deve adaptar-se ao estado do utilizador |

**Regra de Ouro:** Aumentar numerador (T, AmpIA, Lcg, M) OU diminuir denominador (Lci, Lce). Maior alavancagem: **AmpIA** e **Lce**.

---

## Benchmarks de Ke por Formato

| Formato | Ke | Razão |
|---------|-----|-------|
| Reels / TikTok | 3% | Atenção fragmentada, zero prática |
| Curso Online Gravado | 13% | Genérico, sem personalização |
| Mentoria 1:1 | 30% | Personalizado mas não escala |
| Workshop Presencial | 41% | Mão na massa |
| **SaaS com MaaS** | **58%** | IA + UX + Metodologia = 2.4x vs sem MaaS |

**Objectivo do OPE_SQUAD:** Ke entre 40-58%. Escalável como SaaS, eficaz como workshop.

---

## Mapa Competitivo com MaaS

| Categoria | Ke | Limitação |
|-----------|-----|-----------|
| Cursos Online | 13% | Genérico, utilizador fica sozinho após ver o vídeo |
| SaaS Genérico (templates) | 8-10% | Tools sem metodologia |
| Mentoria/Coaching | 30% | Caro, não escala |
| **OPE_SQUAD com MaaS** | **40-58%** | IA personalizada + UX limpa + prática forçada |

---

## Princípios de Design do Produto

1. **Cada ecrã tem um propósito claro** — existe para aumentar T, AmpIA, M, Lcg, ou reduzir Lci/Lce
2. **A IA nunca dá respostas prontas sem contexto** — Socratic questioning primeiro
3. **A IA adapta-se ao perfil** — nicho, fase, recursos, experiência → output genérico = ruído
4. **Uma acção por momento crítico** — múltiplas opções simultâneas = ruído (Lce)
5. **Progresso visível e celebrado** — mantém A(t) alto (motivação)
6. **Templates pré-preenchidos pela IA** — nunca página em branco. Draft que o utilizador revisa
7. **Zero jargão sem tradução** — "product-market fit" → "garantir que as pessoas querem o que vendes"

---

## System Prompt Base para a IA do Produto

```
És um mentor de negócios especializado em ajudar solopreneurs a construir negócios rentáveis.
O teu papel é GUIAR, não dar respostas prontas.

REGRAS:
1. Antes de aconselhar, usa o contexto do utilizador: nicho, fase, recursos, experiência.
2. Usa Socratic questioning: "Como abordarias este problema?" antes de sugerir.
3. Adapta a linguagem ao nível do utilizador. Zero jargão sem explicação.
4. Cada resposta termina com UMA acção concreta que o utilizador pode executar.
5. Valida o trabalho feito com feedback construtivo e específico.
6. Se o utilizador está bloqueado, simplifica o próximo passo (não ignora).
7. Celebra progresso genuíno. Não sejas condescendente.

CONTEXTO DO UTILIZADOR: {user_profile}
FASE ACTUAL DA METODOLOGIA: {current_step}
HISTÓRICO DE ACÇÕES: {action_history}
```

---

## Anti-Patterns a Evitar

- **ChatGPT wrapper genérico** — OPE_SQUAD não é uma caixa de chat. É um sistema guiado.
- **Information overload** — Menos conteúdo, mais acção. Cada palavra que não leva a acção é ruído.
- **Feature creep** — Cada funcionalidade que não aumenta Ke é distracção. Dizer não a 90%.
- **Copy genérico** — "Construa o seu negócio dos sonhos!" não transfere conhecimento.
- **Gamificação vazia** — Badges sem conexão a resultados reais. Só gamificar acções com Lcg.

---

## Métricas MaaS para o OPE_SQUAD

| Métrica | O Que Mede | Objectivo |
|---------|-----------|-----------|
| **Task Completion Rate** | % de tarefas concluídas | >70% |
| **Time to First Value** | Tempo até 1º resultado concreto | <10 min na 1ª sessão |
| **Return Rate D1/D7** | Volta no dia seguinte / semana | Indicador de hábito formado |
| **Action-to-Insight Ratio** | % de sessões com acção real | >70% |
| **AI Interaction Quality** | % de interacções IA que levam a acção | Mede se IA traduz bem ou gera ruído |

---

## Regras de Implementação Técnica

- **Onboarding inteligente:** Recolher nicho, fase, objectivo, tempo disponível
- **Estado persistente:** IA tem acesso ao perfil completo em CADA interacção
- **Progressive disclosure:** Features avançadas só aparecem quando o utilizador está pronto
- **Feedback loops rápidos:** Cada acção tem feedback em <2 segundos (latência = Lce)
- **Fallback gracioso:** IA admite quando não sabe, pede mais contexto — nunca inventa
- **Dados para iteração:** Cada interacção tracked para medir métricas MaaS

---

## Stack Técnico (já em uso no OPE_SQUAD)

| Componente | Ferramenta |
|-----------|-----------|
| Frontend | Next.js 15 + Tailwind CSS v4 |
| Auth | Clerk (Voice DNA guardado em unsafeMetadata) |
| IA | Claude API (Anthropic) |
| Backend/DB | Supabase (a adicionar) |
| Pagamentos | Stripe (a adicionar) |
| Deploy | Vercel |

---

*MaaS Framework v1.0 — Fevereiro 2026 — Projecto OPE_SQUAD*
