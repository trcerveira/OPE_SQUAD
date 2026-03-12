# EOD Review — PUBLYQ Chief

**Cadencia:** Diario (final do dia)
**Duracao:** 3 minutos
**Agente:** /publyq-chief

---

## Trigger

Telmo encerra o dia ou diz "eod", "review", "acabei por hoje", "o que fizemos".

## Formato Obrigatorio

```
EOD REVIEW — [YYYY-MM-DD]

FEITO HOJE:
- [x] [tarefa completada]
- [ ] [tarefa nao completada — motivo + quando]

DELEGACOES A SQUADS:
| Squad | Tarefa | Status |
|-------|--------|--------|
| /content-squad | [tarefa] | [pendente/feito] |
| /saas-dev-squad | [tarefa] | [pendente/feito] |

DECISOES TOMADAS:
- [decisao — razao]

AMANHA — PREVIEW:
1. [prioridade 1]
2. [prioridade 2]

GAP AND GAIN (semanal):
- Inicio da semana: [onde estavamos]
- Agora: [onde estamos]
- Progresso: [o que conquistamos]

SAUDE DO NEGOCIO (semanal):
ACDC: A[0-10] C[0-10] D[0-10] C[0-10]
Fix This Next: Nivel [1-5] — [nome do nivel]
```

## Regras

1. NUNCA saltar o EOD — mesmo que tenha sido dia fraco
2. Sempre medir para TRAS (Gap and Gain)
3. Reportar decisoes tomadas autonomamente
4. Preview de amanha para o Telmo saber o que esperar
5. ACDC e Fix This Next so no review semanal (sexta)

## Veto

- SE EOD nao reporta o que foi feito → refazer
- SE progresso medido para a frente (falta X) → corrigir para Gap and Gain
