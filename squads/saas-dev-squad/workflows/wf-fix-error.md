# Workflow: Fix Error
# Squad: saas-dev-squad
# Trigger: Qualquer erro no projecto

---

## QUANDO USAR
Quando tens um erro e não sabes por onde começar.

---

## FASE 1 — TRIAGEM (2 min)
**Agente:** @saas-dev-squad (chief)

1. Cola a mensagem de erro completa
2. Identifica onde acontece: browser / terminal / Vercel
3. Identifica quando começou: após qual alteração?

**Veto:** Não avançar sem a mensagem de erro completa.

**Checkpoint:** Tipo de erro classificado → routing decidido

---

## FASE 2 — DIAGNÓSTICO (5-10 min)
**Agente:** Conforme routing da Fase 1

| Tipo de erro | Agente |
|---|---|
| TypeScript | @matt-pocock |
| Build / App Router | @delba-oliveira |
| Arquitectura / design | @uncle-bob |
| API route / response | @phil-sturgeon |
| Deploy / Vercel | @lee-robinson |
| Segurança / auth | @tanya-janca |

**Output:** Causa raiz identificada + fix prescrito

---

## FASE 3 — FIX (10-30 min)
**Agente:** Especialista da Fase 2

1. Implementar fix prescrito
2. Verificar que o erro desapareceu
3. Verificar que nada mais partiu

**Veto:** Não fazer deploy sem verificar localmente.

---

## FASE 4 — PREVENÇÃO (5 min)
**Agente:** @kent-dodds

1. Este erro pode repetir-se?
2. Se sim → escrever teste que o captura
3. Commit: `fix: [descrição] + test: previne regressão`

**Output:** Erro corrigido + teste adicionado
